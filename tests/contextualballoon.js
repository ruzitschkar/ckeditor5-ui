/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import ContextualBalloon from '../src/contextualballoon';
import BalloonPanelView from '../src/panel/balloon/balloonpanelview';
import View from '../src/view';
import Template from '../src/template';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

/* global document */

describe( 'ContextualBalloon', () => {
	let editor, editorElement, balloon, viewA, viewB;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor.create( editorElement, {
			plugins: [ ContextualBalloon ]
		} )
		.then( newEditor => {
			editor = newEditor;
			balloon = editor.plugins.get( ContextualBalloon );

			viewA = new ViewA();
			viewB = new ViewB();

			// We don't need to test BalloonPanelView attachTo and pin methods it's enough to check if was called with proper data.
			sinon.stub( balloon.view, 'attachTo', () => {} );
			sinon.stub( balloon.view, 'pin', () => {} );
		} );
	} );

	afterEach( () => {
		editor.destroy();
	} );

	it( 'should be a plugin instance', () => {
		expect( balloon ).to.instanceof( Plugin );
	} );

	describe( 'pluginName', () => {
		it( 'should return plugin by name', () => {
			expect( editor.plugins.get( 'contextualballoon' ) ).to.instanceof( ContextualBalloon );
		} );
	} );

	describe( 'init()', () => {
		it( 'should create a plugin instance with properties', () => {
			expect( balloon.view ).to.instanceof( BalloonPanelView );
		} );

		it( 'should add balloon panel view to editor `body` collection', () => {
			expect( editor.ui.view.body.getIndex( balloon.view ) ).to.above( -1 );
		} );
	} );

	describe( 'hasView()', () => {
		it( 'should return true when given view is in stack', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			expect( balloon.hasView( viewA ) ).to.true;
		} );

		it( 'should return true when given view is in stack but is not visible', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake' }
			} );

			expect( balloon.visibleView ).to.equal( viewB );
			expect( balloon.hasView( viewA ) ).to.true;
		} );

		it( 'should return false when given view is not in stack', () => {
			expect( balloon.hasView( viewA ) ).to.false;
		} );
	} );

	describe( 'add()', () => {
		it( 'should add view to the stack and display in balloon', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			expect( balloon.view.content.length ).to.equal( 1 );
			expect( balloon.view.content.get( 0 ) ).to.deep.equal( viewA );
			expect( balloon.view.pin.calledOnce ).to.true;
			expect( balloon.view.pin.firstCall.args[ 0 ] ).to.deep.equal( { target: 'fake' } );
		} );

		it( 'should pin balloon to the target element', () => {
			balloon.add( {
				view: viewA,
				position: { target: document.createElement( 'div' ) }
			} );

			sinon.assert.calledOnce( balloon.view.pin );
		} );

		it( 'should throw an error when try to add the same view more than once', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			expect( () => {
				balloon.add( {
					view: viewA,
					position: { target: 'fake' }
				} );
			} ).to.throw( CKEditorError, /^contextualballoon-add-view-exist/ );
		} );

		it( 'should add multiple views to he stack and display last one', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake' }
			} );

			expect( balloon.view.content.length ).to.equal( 1 );
			expect( balloon.view.content.get( 0 ) ).to.deep.equal( viewB );
		} );

		it( 'should add multiple views to the stack and keep balloon in the same position', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake', foo: 'bar' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake', bar: 'biz' }
			} );

			expect( balloon.view.pin.calledTwice ).to.true;

			expect( balloon.view.pin.firstCall.args[ 0 ] ).to.deep.equal( {
				target: 'fake',
				foo: 'bar'
			} );

			expect( balloon.view.pin.secondCall.args[ 0 ] ).to.deep.equal( {
				target: 'fake',
				foo: 'bar'
			} );
		} );
	} );

	describe( 'visibleView', () => {
		it( 'should return data of currently visible view', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			expect( balloon.visibleView ).to.equal( viewA );
		} );

		it( 'should return data of currently visible view when there is more than one in the stack', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake' }
			} );

			expect( balloon.visibleView ).to.equal( viewB );
		} );

		it( 'should return `null` when the stack is empty', () => {
			expect( balloon.visibleView ).to.null;
		} );
	} );

	describe( 'remove()', () => {
		it( 'should remove given view and hide balloon when there is no other view to display', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.remove( viewA );

			expect( balloon.visibleView ).to.null;
		} );

		it( 'should remove given view and set previous in the stack as visible when removed view was visible', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake' }
			} );

			balloon.remove( viewB );

			expect( balloon.visibleView ).to.equal( viewA );
		} );

		it( 'should remove given view from the stack when view is not visible', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake' }
			} );

			balloon.remove( viewA );

			expect( balloon.visibleView ).to.equal( viewB );
		} );

		it( 'should throw an error when there is no given view in the stack', () => {
			expect( () => {
				balloon.remove( viewA );
			} ).to.throw( CKEditorError, /^contextualballoon-remove-view-not-exist/ );
		} );
	} );

	describe( 'updatePosition()', () => {
		it( 'should attach balloon to the target using the same position options as first view in the stack', () => {
			balloon.add( {
				view: viewA,
				position: {
					target: 'fake',
					foo: 'bar'
				}
			} );

			balloon.add( {
				view: viewB,
				position: {
					target: 'fake',
					bar: 'biz'
				}
			} );

			balloon.view.attachTo.reset();

			balloon.updatePosition();

			expect( balloon.view.attachTo.calledOnce );
			expect( balloon.view.attachTo.firstCall.args[ 0 ] ).to.deep.equal( {
				target: 'fake',
				foo: 'bar'
			} );
		} );

		it( 'should remove given view from the stack when view is not visible', () => {
			balloon.add( {
				view: viewA,
				position: { target: 'fake' }
			} );

			balloon.add( {
				view: viewB,
				position: { target: 'fake' }
			} );

			balloon.remove( viewA );

			expect( balloon.visibleView ).to.equal( viewB );
		} );

		it( 'should throw an error when there is no given view in the stack', () => {
			expect( () => {
				balloon.remove( viewA );
			} ).to.throw( CKEditorError, /^contextualballoon-remove-view-not-exist/ );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should balloon panel remove view from editor body collection', () => {
			balloon.destroy();

			expect( editor.ui.view.body.getIndex( balloon.view ) ).to.equal( -1 );
		} );
	} );
} );

class ViewA extends View {
	constructor( locale ) {
		super( locale );

		this.template = new Template( {
			tag: 'div'
		} );
	}
}

class ViewB extends View {
	constructor( locale ) {
		super( locale );

		this.template = new Template( {
			tag: 'div'
		} );
	}
}
