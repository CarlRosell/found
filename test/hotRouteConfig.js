import ServerProtocol from 'farce/lib/ServerProtocol';
import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';

import createFarceRouter from '../src/createFarceRouter';
import createRender from '../src/createRender';
import hotRouteConfig from '../src/hotRouteConfig';

import { InstrumentedResolver } from './helpers';

describe('hotRouteConfig', () => {
  afterEach(() => {
    /* eslint-env browser */
    /* eslint-disable no-underscore-dangle */
    delete window.__FOUND_HOT_RELOAD__;
    delete window.__FOUND_REPLACE_ROUTE_CONFIG__;
    /* eslint-enable no-underscore-dangle */
    /* eslint-env browser: false */
  });

  it('should reload the route configuration', async () => {
    const routeConfig = hotRouteConfig([
      {
        path: '/foo',
        render: () => <div className="foo" />,
      },
    ]);

    const Router = createFarceRouter({
      historyProtocol: new ServerProtocol('/foo'),
      routeConfig,

      render: createRender({}),
    });

    const resolver = new InstrumentedResolver();
    const instance = ReactTestUtils.renderIntoDocument(
      <Router resolver={resolver} />,
    );

    await resolver.done;

    ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'foo');
    expect(
      ReactTestUtils.scryRenderedDOMComponentsWithClass(instance, 'bar'),
    ).toHaveLength(0);

    hotRouteConfig([
      {
        path: '/foo',
        render: () => <div className="bar" />,
      },
    ]);

    await resolver.done;

    ReactTestUtils.findRenderedDOMComponentWithClass(instance, 'bar');
    expect(
      ReactTestUtils.scryRenderedDOMComponentsWithClass(instance, 'foo'),
    ).toHaveLength(0);
  });
});
