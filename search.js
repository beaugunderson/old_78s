const fs = require('fs');
const rp = require('request-promise-native');

async function page(pageNumber) {
  const response = await rp.get({
    url: 'https://archive.org/advancedsearch.php',
    qs: {
      q: 'collection:georgeblood AND format:MP3',
      fl: [
        'avg_rating',
        'backup_location',
        'btih',
        'call_number',
        'collection',
        'contributor',
        'coverage',
        'creator',
        'date',
        'description',
        'downloads',
        'external-identifier',
        'foldoutcount',
        'format',
        'headerImage',
        'identifier',
        'imagecount',
        'language',
        'licenseurl',
        'mediatype',
        'members',
        'month',
        'num_reviews',
        'oai_updatedate',
        'publicdate',
        'publisher',
        'related-external-id',
        'reviewdate',
        'rights',
        'scanningcentre',
        'source',
        'stripped_tags',
        'subject',
        'title',
        'type',
        'volume',
        'week',
        'year',
      ],
      'sort': [
        'publicdate asc',
      ],
      rows: '100000000',
      // page: pageNumber || 1,
      output: 'json',
      save: 'yes',
    },
    json: true,
  });

  console.log(`got ${response.response.docs.length} documents`);

  fs.writeFile('./78s.json', JSON.stringify(response.response.docs, null, 2),
               (err) => console.log('err', err));
}

page();
