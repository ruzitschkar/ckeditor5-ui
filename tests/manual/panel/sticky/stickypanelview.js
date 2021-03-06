/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import testUtils from '../../../_utils/utils';
import StickyPanelView from '../../../../src/panel/sticky/stickypanelview';

const ui = testUtils.createTestUIView( {
	stickyToTheTop: '.ck-sticky_to-the-top .ck-editor__top',
	stickyToTheBox: '.ck-sticky_to-the-box .ck-editor__top'
} );

createStickyPanel( ui.stickyToTheTop );
const stickyToTheBoxTPanel = createStickyPanel( ui.stickyToTheBox );

stickyToTheBoxTPanel.viewportTopOffset = 100;

function createStickyPanel( collection ) {
	const panel = new StickyPanelView();

	panel.limiterElement = collection._parentElement.parentNode;

	collection.add( panel );
	panel.isActive = true;

	return panel;
}
