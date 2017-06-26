#!/usr/bin/env node

'use strict';

const async = require('async');
const botUtilities = require('bot-utilities');
const fs = require('fs');
const level = require('level');
const program = require('commander');
const {spawn} = require('child_process');
const Twit = require('twit');
const _ = require('lodash');

const songs = require('./78s.json');
const db = level('./songs');

_.mixin(Twit.prototype, botUtilities.twitMixins);

const T = new Twit(botUtilities.getTwitterAuthFromEnv());

function firstUnused(cb) {
  var unused = false;

  async.whilst(
    () => !unused,
    (cbWhilst) => {
      const entry = songs.shift();

      db.get(entry.identifier, (err) => {
        if (err && err.type === 'NotFoundError') {
          unused = true;

          return cbWhilst(null, entry);
        }

        return cbWhilst(err);
      });
    },
    cb);
}

function creator(song) {
  if (Array.isArray(song.creator)) {
    return `${song.creator[0]} et al.`;
  }

  return song.creator;
}

function url(song) {
  return `https://archive.org/details/${song.identifier}`;
}

program
  .command('tweet')
  .description('Generate and tweet an image')
  .action(() => {
    firstUnused((err, song) => {
      console.log('unused', err, song);

      const generate = spawn('./generate.sh', [song.identifier], {stdio: 'inherit'});

      generate.on('close', (code) => {
        if (code) {
          throw new Error(`non-zero exit code: ${code}`);
        }

        const status = `
🎤 ${creator(song)}
✏ ${song.title}
🔗 ${url(song)}`.trim();

        T.postMediaChunked({file_path: './78.mp4'}, (postError, data) => {
          const mediaId = data.media_id_string;

          // T.post('media/metadata/create', {
          //   media_id: mediaId,
          //   alt_text: {
          //     text: altText
          //   }
          // }, (metadataError, data, response) => {
          //   if (metadataError) {
          //     return console.error('metadata error', metadataError);
          //   }

          T.post('statuses/update', {
            status: status,
            media_ids: [mediaId],
          }, (statusError) => {
            if (statusError) {
              return console.error('status error', statusError);
            }

            db.put(song.identifier, '1', (putError) => {
              console.log(`db.put ${song.identifier} ${putError}`);
            });
          });
          // })
        });
      });
    });
  });

program.parse(process.argv);
