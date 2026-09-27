const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(root, 'site.js'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(ids.length, new Set(ids).size, 'IDs must be unique');
for (const [,id] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(id), 'Missing anchor '+id);
for (const [,src] of html.matchAll(/(?:src|href)="([^"#:]+)"/g)) {
  if (/^(https?:|mailto:|tel:)/.test(src)) continue;
  assert(fs.existsSync(path.join(root, src.replace(/^\//,''))), 'Missing asset '+src);
}
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema['@graph'][0].url, 'https://playtheusualsuspects.com/');
const cards = [...html.matchAll(/<article class="show-card" id="([^"]+)" data-start="([^"]+)" data-end="([^"]+)">([\s\S]*?)<\/article>/g)].map(m => ({
  id:m[1],dataset:{start:m[2],end:m[3]},hidden:false,
  querySelector(selector) { return {textContent: selector === '.show-venue' ? 'Test venue' : 'Saturday · 2:00 PM – 6:00 PM · Address'}; }
}));
assert.equal(cards.length, 6);
cards.forEach(c=>assert(Date.parse(c.dataset.end)>Date.parse(c.dataset.start)));
const hero = {replaceChildren(){this.children=[];},append(...items){this.children=items;}};
const context = {Intl,Date,document:{querySelectorAll:()=>cards,getElementById:()=>hero,createElement:()=>({})}};
vm.createContext(context);
vm.runInContext(js.slice(js.indexOf('function refreshShows'),js.indexOf('refreshShows();')),context);
context.refreshShows(Date.parse('2026-09-06T12:00:00Z'));
assert.equal(hero.href,'#show-1');
context.refreshShows(Date.parse('2026-09-19T19:00:00Z'));
assert.equal(hero.children[0].textContent,'On stage now');
context.refreshShows(Date.parse('2026-09-19T23:00:00Z'));
assert.equal(hero.href,'#show-2');
assert(cards[0].hidden);
context.refreshShows(Date.parse('2026-11-14T20:30:00Z'));
assert.equal(hero.href,'#show-4');
assert.equal(hero.children[0].textContent,'On stage now');
context.refreshShows(Date.parse('2027-01-01T00:00:00Z'));
assert.equal(hero.href,'#show-6');
assert.equal(hero.children[0].textContent,'Next show');
context.refreshShows(Date.parse('2027-01-31T02:00:00Z'));
assert.equal(hero.children[0].textContent,'On stage now');
context.refreshShows(Date.parse('2027-01-31T05:30:00Z'));
assert.equal(hero.href,'#book');
assert(cards.every(c=>c.hidden));
context.FormData = class { constructor(form){this.form=form;} get(key){return this.form[key];} };
vm.runInContext(js.slice(js.indexOf('function buildBookingDraft'),js.indexOf('function submitBookForm')),context);
const draft = context.buildBookingDraft({name:' A & B ',contact:'test@example.com',venue_type:'Private party',event_date:'',notes:'Music & food\n6 PM'});
assert(draft.body.includes('Name: A & B'));
assert(draft.subject.includes('date TBD'));
assert(draft.body.includes('Music & food\n6 PM'));
const mail = new URL(draft.mailto);
assert.equal(mail.pathname,'buck956@att.net');
assert.equal(mail.searchParams.get('body'),draft.body);
assert.equal(mail.searchParams.get('subject'),draft.subject);
assert(!html.includes('YOUR_PIXEL_ID'));
assert(!html.includes('tel:+170****4901'));
console.log('Passed: local assets, anchors, schema, show rollover (Central/DST), empty schedule, booking encoding.');
