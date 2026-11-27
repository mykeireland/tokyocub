/*
 * TOKYO CUB — catalogue
 * ------------------------------------------------------------------
 * `full`    : full-length master (currently the public triple j Unearthed
 *             web files). Best practice: drop Toni's own masters into
 *             /assets/audio/ and point these at them instead.
 * `preview` : 30-second Spotify preview, used when there is no full master
 *             or if the full master fails to load.
 * Every source here must allow CORS so the visualiser can "hear" it.
 */
const UE = 'https://unearthed-audio-prod.akamaized.net/';
const SP = 'https://p.scdn.co/mp3-preview/';

window.TRACKS = [
  {
    title: 'SKYBLUE',
    artists: 'Oliver Silo & Tokyo Cub',
    date: '2026-11-06',
    length: '4:12',
    art: 'assets/img/skyblue.jpg',
    preview: SP + '9710bcb1e9b64867de95d5a50884d2cb12699cda',
    spotify: '3ldam19krBLSDmiAhVujhy',
  },
  {
    title: 'CIGARETTE',
    artists: 'Oliver Silo & Tokyo Cub',
    date: '2026-11-06',
    length: '4:31',
    art: 'assets/img/cigarette.jpg',
    preview: SP + '3c177b665d86a7b0381c3a0ece40139e736a015c',
    spotify: '5lndfNYF2wStEAz77tPari',
  },
  {
    title: 'MUNCHIES',
    artists: 'Tokyo Cub, Lost Kid & WE LOST TOKYO',
    date: '2026-10-30',
    length: '2:45',
    art: 'assets/img/munchies.jpg',
    full: UE + '2c1e3a1c-1473-4898-b450-7ce1f49419d1/38c46395-d0cb-490a-bac2-1c170213468d/TOKYO_CUB___LOST_KID_MUNCHIES_MASTER_V2web.m4a',
    preview: SP + 'aaed7d07f85bfcf2e3cde0f4ff4b50fdb1449eb2',
    spotify: '78anlsHtSyoP0Y59ZUABvO',
    youtube: 'hMbCGFZJXqw',
    unearthed: true,
    start: true, // the track the site opens with
  },
  {
    title: 'WASTED TIME',
    artists: 'Tokyo Cub ft. Feelds',
    date: '2026-07-31',
    length: '2:44',
    art: 'assets/img/wasted-time.jpg',
    full: UE + 'e1688ea6-6c09-40b5-af8c-81a9f2d6bde7/a77bf300-90b8-4fcc-bcea-ee3cc923385b/TOKYO_CUB_WASTED_TIME__MASTER_COPY_web.m4a',
    preview: SP + 'a90a167e11e56ee05ca278bd88f5c6201bae6a5d',
    spotify: '6HVvieBw6iBITrpNI47THl',
    unearthed: true,
  },
  {
    title: 'YELLOW HOUSE',
    artists: 'Oliver Silo & Tokyo Cub',
    date: '2026-01-23',
    length: '3:39',
    art: 'assets/img/yellow-house.jpg',
    preview: SP + 'cc676f6acd9024c7bb7b898c6d376b1f53859fa8',
    spotify: '210qCh9Jb9b8ryyNyDe1IM',
  },
  {
    title: 'HTD (Part A)',
    artists: 'Tokyo Cub & Lost Kid',
    date: '2025-11-28',
    length: '1:34',
    art: 'assets/img/htd-part-a.jpg',
    preview: SP + 'ceb2fde2edd8b12188d57fbda2fe8f15aecceafc',
    spotify: '1cvdstQ48u2HPpMnE9n8dk',
  },
  {
    title: 'HTD (The Interlude)',
    artists: 'Tokyo Cub, Lost Kid & LIFEOFTI',
    date: '2025-11-14',
    length: '2:40',
    art: 'assets/img/htd-interlude.jpg',
    preview: SP + '04e9784213e4f0c86392dc2cc09155d7da38a363',
    spotify: '6iqIKJY66NThl9y9SRq1PP',
  },
  {
    title: '2AM',
    artists: 'Oliver Silo & Tokyo Cub',
    date: '2025-10-31',
    length: '2:52',
    art: 'assets/img/2am.jpg',
    preview: SP + 'b272f0747736c5d36cbfa66149de59507bba89ee',
    spotify: '5gkRxQgOIcTG7rgJSbvBlz',
    youtube: 'bVA6gX3qtpA',
  },
  {
    title: 'JANE',
    artists: 'Oliver Silo & Tokyo Cub',
    date: '2025-02-14',
    length: '3:28',
    art: 'assets/img/jane.jpg',
    preview: SP + 'd2849373569d2f39c96736b03583b1b5ce6f910b',
    spotify: '15XgckabLA81sPTqzL8TQ6',
    youtube: 'fdXJ9zMUUDk',
  },
  {
    title: 'FIRE',
    artists: 'Tokyo Cub & Lost Kid',
    date: '2024-10-11',
    length: '3:02',
    art: 'assets/img/fire.jpg',
    full: UE + '5d18fdc7-942a-4f7d-b780-83b3ae64c517/caa0bbb5-44aa-4b65-b13b-2f5b7bbdaa0a/Tokyo_Cub___Lost_Kid___FIRE__MASTER_web.m4a',
    preview: SP + 'c34a7380cef50bad3ab7e0cda5790013eb262e05',
    spotify: '4jqSc2uJQ2mRWGS8pcIeQ9',
    youtube: 'ToqTAq8FuXk',
    unearthed: true,
  },
];

window.VIDEOS = [
  { id: 'hMbCGFZJXqw', title: 'MUNCHIES', by: 'Tokyo Cub, Lost Kid & WE LOST TOKYO', note: 'Official Music Video' },
  { id: 'bVA6gX3qtpA', title: '2AM', by: 'Oliver Silo & Tokyo Cub', note: 'Official Music Video' },
  { id: 'ToqTAq8FuXk', title: 'FIRE', by: 'Tokyo Cub & Lost Kid', note: 'Official Music Video' },
  { id: 'fdXJ9zMUUDk', title: 'JANE', by: 'Oliver Silo & Tokyo Cub ft. Laura Carville', note: 'Alt Version' },
];
