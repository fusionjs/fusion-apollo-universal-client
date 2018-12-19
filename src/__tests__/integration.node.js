/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */
/* eslint-env node */

import path from 'path';

import puppeteer from 'puppeteer';
import {test} from 'fusion-test-utils';
import {dev} from 'fusion-cli/test/e2e/utils';

test('able to hydrate GraphQL data from SSR render', async t => {
  const dir = path.resolve(__dirname, '../../app-fixture');
  const {proc, port} = await dev(`--dir=${dir}`);

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  const allUrls = [];
  page.on('response', response => {
    const req = response.request();
    allUrls.push(req.url());
  });

  await page.goto(`http://localhost:${port}/`, {waitUntil: 'load'});

  const content = await page.content();
  const expectedResult = {
    getHello: {name: 'Hello World', __typename: 'Test'},
  };
  t.ok(
    content.includes(JSON.stringify(expectedResult)),
    'app content contains mock GQL result'
  );

  t.ok(
    !allUrls.some(val => val.includes('/graphql')),
    'did not find any requests to /graphql'
  );

  await browser.close();
  proc.kill();
  // $FlowFixMe - Need to add timeouts
}, 60000);
