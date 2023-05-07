﻿/*! DataTables 1.13.2
 * ©2008-2023 SpryMedia Ltd - datatables.net/license
 */

/**
 * @summary     DataTables
 * @description Paginate, search and order HTML tables
 * @version     1.13.2
 * @author      SpryMedia Ltd
 * @contact     www.datatables.net
 * @copyright   SpryMedia Ltd.
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

/*jslint evil: true, undef: true, browser: true */
/*globals $,require,jQuery,define,_selector_run,_selector_opts,_selector_first,_selector_row_indexes,_ext,_Api,_api_register,_api_registerPlural,_re_new_lines,_re_html,_re_formatted_numeric,_re_escape_regex,_empty,_intVal,_numToDecimal,_isNumber,_isHtml,_htmlNumeric,_pluck,_pluck_order,_range,_stripHtml,_unique,_fnBuildAjax,_fnAjaxUpdate,_fnAjaxParameters,_fnAjaxUpdateDraw,_fnAjaxDataSrc,_fnAddColumn,_fnColumnOptions,_fnAdjustColumnSizing,_fnVisibleToColumnIndex,_fnColumnIndexToVisible,_fnVisbleColumns,_fnGetColumns,_fnColumnTypes,_fnApplyColumnDefs,_fnHungarianMap,_fnCamelToHungarian,_fnLanguageCompat,_fnBrowserDetect,_fnAddData,_fnAddTr,_fnNodeToDataIndex,_fnNodeToColumnIndex,_fnGetCellData,_fnSetCellData,_fnSplitObjNotation,_fnGetObjectDataFn,_fnSetObjectDataFn,_fnGetDataMaster,_fnClearTable,_fnDeleteIndex,_fnInvalidate,_fnGetRowElements,_fnCreateTr,_fnBuildHead,_fnDrawHead,_fnDraw,_fnReDraw,_fnAddOptionsHtml,_fnDetectHeader,_fnGetUniqueThs,_fnFeatureHtmlFilter,_fnFilterComplete,_fnFilterCustom,_fnFilterColumn,_fnFilter,_fnFilterCreateSearch,_fnEscapeRegex,_fnFilterData,_fnFeatureHtmlInfo,_fnUpdateInfo,_fnInfoMacros,_fnInitialise,_fnInitComplete,_fnLengthChange,_fnFeatureHtmlLength,_fnFeatureHtmlPaginate,_fnPageChange,_fnFeatureHtmlProcessing,_fnProcessingDisplay,_fnFeatureHtmlTable,_fnScrollDraw,_fnApplyToChildren,_fnCalculateColumnWidths,_fnThrottle,_fnConvertToWidth,_fnGetWidestNode,_fnGetMaxLenString,_fnStringToCss,_fnSortFlatten,_fnSort,_fnSortAria,_fnSortListener,_fnSortAttachListener,_fnSortingClasses,_fnSortData,_fnSaveState,_fnLoadState,_fnSettingsFromNode,_fnLog,_fnMap,_fnBindAction,_fnCallbackReg,_fnCallbackFire,_fnLengthOverflow,_fnRenderer,_fnDataSource,_fnRowAttributes*/

(function (factory) {
	"use strict";

	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], function ($) {
			return factory($, window, document);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		module.exports = function (root, $) {
			if (!root) {
				// CommonJS environments without a window global must pass a
				// root. This will give an error otherwise
				root = window;
			}

			if (!$) {
				$ = typeof window !== 'undefined' ? // jQuery's factory checks for a global window
					require('jquery') :
					require('jquery')(root);
			}

			return factory($, root, root.document);
		};
	}
	else {
		// Browser
		window.DataTable = factory(jQuery, window, document);
	}
}
	(function ($, window, document, undefined) {
		"use strict";


		var DataTable = function (selector, options) {
			// When creating with `new`, create a new DataTable, returning the API instance
			if (this instanceof DataTable) {
				return $(selector).DataTable(options);
			}
			else {
				// Argument switching
				options = selector;
			}

			/**
			 * Perform a jQuery selector action on the table's TR elements (from the tbody) and
			 * return the resulting jQuery object.
			 *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
			 *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
			 *  @param {string} [oOpts.filter=none] Select TR elements that meet the current filter
			 *    criterion ("applied") or all TR elements (i.e. no filter).
			 *  @param {string} [oOpts.order=current] Order of the TR elements in the processed array.
			 *    Can be either 'current', whereby the current sorting of the table is used, or
			 *    'original' whereby the original order the data was read into the table is used.
			 *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
			 *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
			 *    'current' and filter is 'applied', regardless of what they might be given as.
			 *  @returns {object} jQuery object, filtered by the given selector.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Highlight every second row
			 *      oTable.$('tr:odd').css('backgroundColor', 'blue');
			 *    } );
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Filter to rows with 'Webkit' in them, add a background colour and then
			 *      // remove the filter, thus highlighting the 'Webkit' rows only.
			 *      oTable.fnFilter('Webkit');
			 *      oTable.$('tr', {"search": "applied"}).css('backgroundColor', 'blue');
			 *      oTable.fnFilter('');
			 *    } );
			 */
			this.$ = function (sSelector, oOpts) {
				return this.api(true).$(sSelector, oOpts);
			};


			/**
			 * Almost identical to $ in operation, but in this case returns the data for the matched
			 * rows - as such, the jQuery selector used should match TR row nodes or TD/TH cell nodes
			 * rather than any descendants, so the data can be obtained for the row/cell. If matching
			 * rows are found, the data returned is the original data array/object that was used to
			 * create the row (or a generated array if from a DOM source).
			 *
			 * This method is often useful in-combination with $ where both functions are given the
			 * same parameters and the array indexes will match identically.
			 *  @param {string|node|jQuery} sSelector jQuery selector or node collection to act on
			 *  @param {object} [oOpts] Optional parameters for modifying the rows to be included
			 *  @param {string} [oOpts.filter=none] Select elements that meet the current filter
			 *    criterion ("applied") or all elements (i.e. no filter).
			 *  @param {string} [oOpts.order=current] Order of the data in the processed array.
			 *    Can be either 'current', whereby the current sorting of the table is used, or
			 *    'original' whereby the original order the data was read into the table is used.
			 *  @param {string} [oOpts.page=all] Limit the selection to the currently displayed page
			 *    ("current") or not ("all"). If 'current' is given, then order is assumed to be
			 *    'current' and filter is 'applied', regardless of what they might be given as.
			 *  @returns {array} Data for the matched elements. If any elements, as a result of the
			 *    selector, were not TR, TD or TH elements in the DataTable, they will have a null
			 *    entry in the array.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Get the data from the first row in the table
			 *      var data = oTable._('tr:first');
			 *
			 *      // Do something useful with the data
			 *      alert( "First cell is: "+data[0] );
			 *    } );
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Filter to 'Webkit' and get all data for
			 *      oTable.fnFilter('Webkit');
			 *      var data = oTable._('tr', {"search": "applied"});
			 *
			 *      // Do something with the data
			 *      alert( data.length+" rows matched the search" );
			 *    } );
			 */
			this._ = function (sSelector, oOpts) {
				return this.api(true).rows(sSelector, oOpts).data();
			};


			/**
			 * Create a DataTables Api instance, with the currently selected tables for
			 * the Api's context.
			 * @param {boolean} [traditional=false] Set the API instance's context to be
			 *   only the table referred to by the `DataTable.ext.iApiIndex` option, as was
			 *   used in the API presented by DataTables 1.9- (i.e. the traditional mode),
			 *   or if all tables captured in the jQuery object should be used.
			 * @return {DataTables.Api}
			 */
			this.api = function (traditional) {
				return traditional ?
					new _Api(
						_fnSettingsFromNode(this[_ext.iApiIndex])
					) :
					new _Api(this);
			};


			/**
			 * Add a single new row or multiple rows of data to the table. Please note
			 * that this is suitable for client-side processing only - if you are using
			 * server-side processing (i.e. "bServerSide": true), then to add data, you
			 * must add it to the data source, i.e. the server-side, through an Ajax call.
			 *  @param {array|object} data The data to be added to the table. This can be:
			 *    <ul>
			 *      <li>1D array of data - add a single row with the data provided</li>
			 *      <li>2D array of arrays - add multiple rows in a single call</li>
			 *      <li>object - data object when using <i>mData</i></li>
			 *      <li>array of objects - multiple data objects when using <i>mData</i></li>
			 *    </ul>
			 *  @param {bool} [redraw=true] redraw the table or not
			 *  @returns {array} An array of integers, representing the list of indexes in
			 *    <i>aoData</i> ({@link DataTable.models.oSettings}) that have been added to
			 *    the table.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    // Global var for counter
			 *    var giCount = 2;
			 *
			 *    $(document).ready(function() {
			 *      $('#example').dataTable();
			 *    } );
			 *
			 *    function fnClickAddRow() {
			 *      $('#example').dataTable().fnAddData( [
			 *        giCount+".1",
			 *        giCount+".2",
			 *        giCount+".3",
			 *        giCount+".4" ]
			 *      );
			 *
			 *      giCount++;
			 *    }
			 */
			this.fnAddData = function (data, redraw) {
				var api = this.api(true);

				/* Check if we want to add multiple rows or not */
				var rows = Array.isArray(data) && (Array.isArray(data[0]) || $.isPlainObject(data[0])) ?
					api.rows.add(data) :
					api.row.add(data);

				if (redraw === undefined || redraw) {
					api.draw();
				}

				return rows.flatten().toArray();
			};


			/**
			 * This function will make DataTables recalculate the column sizes, based on the data
			 * contained in the table and the sizes applied to the columns (in the DOM, CSS or
			 * through the sWidth parameter). This can be useful when the width of the table's
			 * parent element changes (for example a window resize).
			 *  @param {boolean} [bRedraw=true] Redraw the table or not, you will typically want to
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable( {
			 *        "sScrollY": "200px",
			 *        "bPaginate": false
			 *      } );
			 *
			 *      $(window).on('resize', function () {
			 *        oTable.fnAdjustColumnSizing();
			 *      } );
			 *    } );
			 */
			this.fnAdjustColumnSizing = function (bRedraw) {
				var api = this.api(true).columns.adjust();
				var settings = api.settings()[0];
				var scroll = settings.oScroll;

				if (bRedraw === undefined || bRedraw) {
					api.draw(false);
				}
				else if (scroll.sX !== "" || scroll.sY !== "") {
					/* If not redrawing, but scrolling, we want to apply the new column sizes anyway */
					_fnScrollDraw(settings);
				}
			};


			/**
			 * Quickly and simply clear a table
			 *  @param {bool} [bRedraw=true] redraw the table or not
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Immediately 'nuke' the current rows (perhaps waiting for an Ajax callback...)
			 *      oTable.fnClearTable();
			 *    } );
			 */
			this.fnClearTable = function (bRedraw) {
				var api = this.api(true).clear();

				if (bRedraw === undefined || bRedraw) {
					api.draw();
				}
			};


			/**
			 * The exact opposite of 'opening' a row, this function will close any rows which
			 * are currently 'open'.
			 *  @param {node} nTr the table row to 'close'
			 *  @returns {int} 0 on success, or 1 if failed (can't find the row)
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable;
			 *
			 *      // 'open' an information row when a row is clicked on
			 *      $('#example tbody tr').click( function () {
			 *        if ( oTable.fnIsOpen(this) ) {
			 *          oTable.fnClose( this );
			 *        } else {
			 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
			 *        }
			 *      } );
			 *
			 *      oTable = $('#example').dataTable();
			 *    } );
			 */
			this.fnClose = function (nTr) {
				this.api(true).row(nTr).child.hide();
			};


			/**
			 * Remove a row for the table
			 *  @param {mixed} target The index of the row from aoData to be deleted, or
			 *    the TR element you want to delete
			 *  @param {function|null} [callBack] Callback function
			 *  @param {bool} [redraw=true] Redraw the table or not
			 *  @returns {array} The row that was deleted
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Immediately remove the first row
			 *      oTable.fnDeleteRow( 0 );
			 *    } );
			 */
			this.fnDeleteRow = function (target, callback, redraw) {
				var api = this.api(true);
				var rows = api.rows(target);
				var settings = rows.settings()[0];
				var data = settings.aoData[rows[0][0]];

				rows.remove();

				if (callback) {
					callback.call(this, settings, data);
				}

				if (redraw === undefined || redraw) {
					api.draw();
				}

				return data;
			};


			/**
			 * Restore the table to it's original state in the DOM by removing all of DataTables
			 * enhancements, alterations to the DOM structure of the table and event listeners.
			 *  @param {boolean} [remove=false] Completely remove the table from the DOM
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      // This example is fairly pointless in reality, but shows how fnDestroy can be used
			 *      var oTable = $('#example').dataTable();
			 *      oTable.fnDestroy();
			 *    } );
			 */
			this.fnDestroy = function (remove) {
				this.api(true).destroy(remove);
			};


			/**
			 * Redraw the table
			 *  @param {bool} [complete=true] Re-filter and resort (if enabled) the table before the draw.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Re-draw the table - you wouldn't want to do it here, but it's an example :-)
			 *      oTable.fnDraw();
			 *    } );
			 */
			this.fnDraw = function (complete) {
				// Note that this isn't an exact match to the old call to _fnDraw - it takes
				// into account the new data, but can hold position.
				this.api(true).draw(complete);
			};


			/**
			 * Filter the input based on data
			 *  @param {string} sInput String to filter the table on
			 *  @param {int|null} [iColumn] Column to limit filtering to
			 *  @param {bool} [bRegex=false] Treat as regular expression or not
			 *  @param {bool} [bSmart=true] Perform smart filtering or not
			 *  @param {bool} [bShowGlobal=true] Show the input global filter in it's input box(es)
			 *  @param {bool} [bCaseInsensitive=true] Do case-insensitive matching (true) or not (false)
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Sometime later - filter...
			 *      oTable.fnFilter( 'test string' );
			 *    } );
			 */
			this.fnFilter = function (sInput, iColumn, bRegex, bSmart, bShowGlobal, bCaseInsensitive) {
				var api = this.api(true);

				if (iColumn === null || iColumn === undefined) {
					api.search(sInput, bRegex, bSmart, bCaseInsensitive);
				}
				else {
					api.column(iColumn).search(sInput, bRegex, bSmart, bCaseInsensitive);
				}

				api.draw();
			};


			/**
			 * Get the data for the whole table, an individual row or an individual cell based on the
			 * provided parameters.
			 *  @param {int|node} [src] A TR row node, TD/TH cell node or an integer. If given as
			 *    a TR node then the data source for the whole row will be returned. If given as a
			 *    TD/TH cell node then iCol will be automatically calculated and the data for the
			 *    cell returned. If given as an integer, then this is treated as the aoData internal
			 *    data index for the row (see fnGetPosition) and the data for that row used.
			 *  @param {int} [col] Optional column index that you want the data of.
			 *  @returns {array|object|string} If mRow is undefined, then the data for all rows is
			 *    returned. If mRow is defined, just data for that row, and is iCol is
			 *    defined, only data for the designated cell is returned.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    // Row data
			 *    $(document).ready(function() {
			 *      oTable = $('#example').dataTable();
			 *
			 *      oTable.$('tr').click( function () {
			 *        var data = oTable.fnGetData( this );
			 *        // ... do something with the array / object of data for the row
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Individual cell data
			 *    $(document).ready(function() {
			 *      oTable = $('#example').dataTable();
			 *
			 *      oTable.$('td').click( function () {
			 *        var sData = oTable.fnGetData( this );
			 *        alert( 'The cell clicked on had the value of '+sData );
			 *      } );
			 *    } );
			 */
			this.fnGetData = function (src, col) {
				var api = this.api(true);

				if (src !== undefined) {
					var type = src.nodeName ? src.nodeName.toLowerCase() : '';

					return col !== undefined || type == 'td' || type == 'th' ?
						api.cell(src, col).data() :
						api.row(src).data() || null;
				}

				return api.data().toArray();
			};


			/**
			 * Get an array of the TR nodes that are used in the table's body. Note that you will
			 * typically want to use the '$' API method in preference to this as it is more
			 * flexible.
			 *  @param {int} [iRow] Optional row index for the TR element you want
			 *  @returns {array|node} If iRow is undefined, returns an array of all TR elements
			 *    in the table's body, or iRow is defined, just the TR element requested.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Get the nodes from the table
			 *      var nNodes = oTable.fnGetNodes( );
			 *    } );
			 */
			this.fnGetNodes = function (iRow) {
				var api = this.api(true);

				return iRow !== undefined ?
					api.row(iRow).node() :
					api.rows().nodes().flatten().toArray();
			};


			/**
			 * Get the array indexes of a particular cell from it's DOM element
			 * and column index including hidden columns
			 *  @param {node} node this can either be a TR, TD or TH in the table's body
			 *  @returns {int} If nNode is given as a TR, then a single index is returned, or
			 *    if given as a cell, an array of [row index, column index (visible),
			 *    column index (all)] is given.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      $('#example tbody td').click( function () {
			 *        // Get the position of the current data from the node
			 *        var aPos = oTable.fnGetPosition( this );
			 *
			 *        // Get the data array for this row
			 *        var aData = oTable.fnGetData( aPos[0] );
			 *
			 *        // Update the data array and return the value
			 *        aData[ aPos[1] ] = 'clicked';
			 *        this.innerHTML = 'clicked';
			 *      } );
			 *
			 *      // Init DataTables
			 *      oTable = $('#example').dataTable();
			 *    } );
			 */
			this.fnGetPosition = function (node) {
				var api = this.api(true);
				var nodeName = node.nodeName.toUpperCase();

				if (nodeName == 'TR') {
					return api.row(node).index();
				}
				else if (nodeName == 'TD' || nodeName == 'TH') {
					var cell = api.cell(node).index();

					return [
						cell.row,
						cell.columnVisible,
						cell.column
					];
				}
				return null;
			};


			/**
			 * Check to see if a row is 'open' or not.
			 *  @param {node} nTr the table row to check
			 *  @returns {boolean} true if the row is currently open, false otherwise
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable;
			 *
			 *      // 'open' an information row when a row is clicked on
			 *      $('#example tbody tr').click( function () {
			 *        if ( oTable.fnIsOpen(this) ) {
			 *          oTable.fnClose( this );
			 *        } else {
			 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
			 *        }
			 *      } );
			 *
			 *      oTable = $('#example').dataTable();
			 *    } );
			 */
			this.fnIsOpen = function (nTr) {
				return this.api(true).row(nTr).child.isShown();
			};


			/**
			 * This function will place a new row directly after a row which is currently
			 * on display on the page, with the HTML contents that is passed into the
			 * function. This can be used, for example, to ask for confirmation that a
			 * particular record should be deleted.
			 *  @param {node} nTr The table row to 'open'
			 *  @param {string|node|jQuery} mHtml The HTML to put into the row
			 *  @param {string} sClass Class to give the new TD cell
			 *  @returns {node} The row opened. Note that if the table row passed in as the
			 *    first parameter, is not found in the table, this method will silently
			 *    return.
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable;
			 *
			 *      // 'open' an information row when a row is clicked on
			 *      $('#example tbody tr').click( function () {
			 *        if ( oTable.fnIsOpen(this) ) {
			 *          oTable.fnClose( this );
			 *        } else {
			 *          oTable.fnOpen( this, "Temporary row opened", "info_row" );
			 *        }
			 *      } );
			 *
			 *      oTable = $('#example').dataTable();
			 *    } );
			 */
			this.fnOpen = function (nTr, mHtml, sClass) {
				return this.api(true)
					.row(nTr)
					.child(mHtml, sClass)
					.show()
					.child()[0];
			};


			/**
			 * Change the pagination - provides the internal logic for pagination in a simple API
			 * function. With this function you can have a DataTables table go to the next,
			 * previous, first or last pages.
			 *  @param {string|int} mAction Paging action to take: "first", "previous", "next" or "last"
			 *    or page number to jump to (integer), note that page 0 is the first page.
			 *  @param {bool} [bRedraw=true] Redraw the table or not
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *      oTable.fnPageChange( 'next' );
			 *    } );
			 */
			this.fnPageChange = function (mAction, bRedraw) {
				var api = this.api(true).page(mAction);

				if (bRedraw === undefined || bRedraw) {
					api.draw(false);
				}
			};


			/**
			 * Show a particular column
			 *  @param {int} iCol The column whose display should be changed
			 *  @param {bool} bShow Show (true) or hide (false) the column
			 *  @param {bool} [bRedraw=true] Redraw the table or not
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Hide the second column after initialisation
			 *      oTable.fnSetColumnVis( 1, false );
			 *    } );
			 */
			this.fnSetColumnVis = function (iCol, bShow, bRedraw) {
				var api = this.api(true).column(iCol).visible(bShow);

				if (bRedraw === undefined || bRedraw) {
					api.columns.adjust().draw();
				}
			};


			/**
			 * Get the settings for a particular table for external manipulation
			 *  @returns {object} DataTables settings object. See
			 *    {@link DataTable.models.oSettings}
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *      var oSettings = oTable.fnSettings();
			 *
			 *      // Show an example parameter from the settings
			 *      alert( oSettings._iDisplayStart );
			 *    } );
			 */
			this.fnSettings = function () {
				return _fnSettingsFromNode(this[_ext.iApiIndex]);
			};


			/**
			 * Sort the table by a particular column
			 *  @param {int} iCol the data index to sort on. Note that this will not match the
			 *    'display index' if you have hidden data entries
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Sort immediately with columns 0 and 1
			 *      oTable.fnSort( [ [0,'asc'], [1,'asc'] ] );
			 *    } );
			 */
			this.fnSort = function (aaSort) {
				this.api(true).order(aaSort).draw();
			};


			/**
			 * Attach a sort listener to an element for a given column
			 *  @param {node} nNode the element to attach the sort listener to
			 *  @param {int} iColumn the column that a click on this node will sort on
			 *  @param {function} [fnCallback] callback function when sort is run
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *
			 *      // Sort on column 1, when 'sorter' is clicked on
			 *      oTable.fnSortListener( document.getElementById('sorter'), 1 );
			 *    } );
			 */
			this.fnSortListener = function (nNode, iColumn, fnCallback) {
				this.api(true).order.listener(nNode, iColumn, fnCallback);
			};


			/**
			 * Update a table cell or row - this method will accept either a single value to
			 * update the cell with, an array of values with one element for each column or
			 * an object in the same format as the original data source. The function is
			 * self-referencing in order to make the multi column updates easier.
			 *  @param {object|array|string} mData Data to update the cell/row with
			 *  @param {node|int} mRow TR element you want to update or the aoData index
			 *  @param {int} [iColumn] The column to update, give as null or undefined to
			 *    update a whole row.
			 *  @param {bool} [bRedraw=true] Redraw the table or not
			 *  @param {bool} [bAction=true] Perform pre-draw actions or not
			 *  @returns {int} 0 on success, 1 on error
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *      oTable.fnUpdate( 'Example update', 0, 0 ); // Single cell
			 *      oTable.fnUpdate( ['a', 'b', 'c', 'd', 'e'], $('tbody tr')[0] ); // Row
			 *    } );
			 */
			this.fnUpdate = function (mData, mRow, iColumn, bRedraw, bAction) {
				var api = this.api(true);

				if (iColumn === undefined || iColumn === null) {
					api.row(mRow).data(mData);
				}
				else {
					api.cell(mRow, iColumn).data(mData);
				}

				if (bAction === undefined || bAction) {
					api.columns.adjust();
				}

				if (bRedraw === undefined || bRedraw) {
					api.draw();
				}
				return 0;
			};


			/**
			 * Provide a common method for plug-ins to check the version of DataTables being used, in order
			 * to ensure compatibility.
			 *  @param {string} sVersion Version string to check for, in the format "X.Y.Z". Note that the
			 *    formats "X" and "X.Y" are also acceptable.
			 *  @returns {boolean} true if this version of DataTables is greater or equal to the required
			 *    version, or false if this version of DataTales is not suitable
			 *  @method
			 *  @dtopt API
			 *  @deprecated Since v1.10
			 *
			 *  @example
			 *    $(document).ready(function() {
			 *      var oTable = $('#example').dataTable();
			 *      alert( oTable.fnVersionCheck( '1.9.0' ) );
			 *    } );
			 */
			this.fnVersionCheck = _ext.fnVersionCheck;


			var _that = this;
			var emptyInit = options === undefined;
			var len = this.length;

			if (emptyInit) {
				options = {};
			}

			this.oApi = this.internal = _ext.internal;

			// Extend with old style plug-in API methods
			for (var fn in DataTable.ext.internal) {
				if (fn) {
					this[fn] = _fnExternApiFunc(fn);
				}
			}

			this.each(function () {
				// For each initialisation we want to give it a clean initialisation
				// object that can be bashed around
				var o = {};
				var oInit = len > 1 ? // optimisation for single table case
					_fnExtend(o, options, true) :
					options;

				/*global oInit,_that,emptyInit*/
				var i = 0, iLen, j, jLen, k, kLen;
				var sId = this.getAttribute('id');
				var bInitHandedOff = false;
				var defaults = DataTable.defaults;
				var $this = $(this);


				/* Sanity check */
				if (this.nodeName.toLowerCase() != 'table') {
					_fnLog(null, 0, 'Non-table node initialisation (' + this.nodeName + ')', 2);
					return;
				}

				/* Backwards compatibility for the defaults */
				_fnCompatOpts(defaults);
				_fnCompatCols(defaults.column);

				/* Convert the camel-case defaults to Hungarian */
				_fnCamelToHungarian(defaults, defaults, true);
				_fnCamelToHungarian(defaults.column, defaults.column, true);

				/* Setting up the initialisation object */
				_fnCamelToHungarian(defaults, $.extend(oInit, $this.data()), true);



				/* Check to see if we are re-initialising a table */
				var allSettings = DataTable.settings;
				for (i = 0, iLen = allSettings.length; i < iLen; i++) {
					var s = allSettings[i];

					/* Base check on table node */
					if (
						s.nTable == this ||
						(s.nTHead && s.nTHead.parentNode == this) ||
						(s.nTFoot && s.nTFoot.parentNode == this)
					) {
						var bRetrieve = oInit.bRetrieve !== undefined ? oInit.bRetrieve : defaults.bRetrieve;
						var bDestroy = oInit.bDestroy !== undefined ? oInit.bDestroy : defaults.bDestroy;

						if (emptyInit || bRetrieve) {
							return s.oInstance;
						}
						else if (bDestroy) {
							s.oInstance.fnDestroy();
							break;
						}
						else {
							_fnLog(s, 0, 'Cannot reinitialise DataTable', 3);
							return;
						}
					}

					/* If the element we are initialising has the same ID as a table which was previously
					 * initialised, but the table nodes don't match (from before) then we destroy the old
					 * instance by simply deleting it. This is under the assumption that the table has been
					 * destroyed by other methods. Anyone using non-id selectors will need to do this manually
					 */
					if (s.sTableId == this.id) {
						allSettings.splice(i, 1);
						break;
					}
				}

				/* Ensure the table has an ID - required for accessibility */
				if (sId === null || sId === "") {
					sId = "DataTables_Table_" + (DataTable.ext._unique++);
					this.id = sId;
				}

				/* Create the settings object for this table and set some of the default parameters */
				var oSettings = $.extend(true, {}, DataTable.models.oSettings, {
					"sDestroyWidth": $this[0].style.width,
					"sInstance": sId,
					"sTableId": sId
				});
				oSettings.nTable = this;
				oSettings.oApi = _that.internal;
				oSettings.oInit = oInit;

				allSettings.push(oSettings);

				// Need to add the instance after the instance after the settings object has been added
				// to the settings array, so we can self reference the table instance if more than one
				oSettings.oInstance = (_that.length === 1) ? _that : $this.dataTable();

				// Backwards compatibility, before we apply all the defaults
				_fnCompatOpts(oInit);
				_fnLanguageCompat(oInit.oLanguage);

				// If the length menu is given, but the init display length is not, use the length menu
				if (oInit.aLengthMenu && !oInit.iDisplayLength) {
					oInit.iDisplayLength = Array.isArray(oInit.aLengthMenu[0]) ?
						oInit.aLengthMenu[0][0] : oInit.aLengthMenu[0];
				}

				// Apply the defaults and init options to make a single init object will all
				// options defined from defaults and instance options.
				oInit = _fnExtend($.extend(true, {}, defaults), oInit);


				// Map the initialisation options onto the settings object
				_fnMap(oSettings.oFeatures, oInit, [
					"bPaginate",
					"bLengthChange",
					"bFilter",
					"bSort",
					"bSortMulti",
					"bInfo",
					"bProcessing",
					"bAutoWidth",
					"bSortClasses",
					"bServerSide",
					"bDeferRender"
				]);
				_fnMap(oSettings, oInit, [
					"asStripeClasses",
					"ajax",
					"fnServerData",
					"fnFormatNumber",
					"sServerMethod",
					"aaSorting",
					"aaSortingFixed",
					"aLengthMenu",
					"sPaginationType",
					"sAjaxSource",
					"sAjaxDataProp",
					"iStateDuration",
					"sDom",
					"bSortCellsTop",
					"iTabIndex",
					"fnStateLoadCallback",
					"fnStateSaveCallback",
					"renderer",
					"searchDelay",
					"rowId",
					["iCookieDuration", "iStateDuration"], // backwards compat
					["oSearch", "oPreviousSearch"],
					["aoSearchCols", "aoPreSearchCols"],
					["iDisplayLength", "_iDisplayLength"]
				]);
				_fnMap(oSettings.oScroll, oInit, [
					["sScrollX", "sX"],
					["sScrollXInner", "sXInner"],
					["sScrollY", "sY"],
					["bScrollCollapse", "bCollapse"]
				]);
				_fnMap(oSettings.oLanguage, oInit, "fnInfoCallback");

				/* Callback functions which are array driven */
				_fnCallbackReg(oSettings, 'aoDrawCallback', oInit.fnDrawCallback, 'user');
				_fnCallbackReg(oSettings, 'aoServerParams', oInit.fnServerParams, 'user');
				_fnCallbackReg(oSettings, 'aoStateSaveParams', oInit.fnStateSaveParams, 'user');
				_fnCallbackReg(oSettings, 'aoStateLoadParams', oInit.fnStateLoadParams, 'user');
				_fnCallbackReg(oSettings, 'aoStateLoaded', oInit.fnStateLoaded, 'user');
				_fnCallbackReg(oSettings, 'aoRowCallback', oInit.fnRowCallback, 'user');
				_fnCallbackReg(oSettings, 'aoRowCreatedCallback', oInit.fnCreatedRow, 'user');
				_fnCallbackReg(oSettings, 'aoHeaderCallback', oInit.fnHeaderCallback, 'user');
				_fnCallbackReg(oSettings, 'aoFooterCallback', oInit.fnFooterCallback, 'user');
				_fnCallbackReg(oSettings, 'aoInitComplete', oInit.fnInitComplete, 'user');
				_fnCallbackReg(oSettings, 'aoPreDrawCallback', oInit.fnPreDrawCallback, 'user');

				oSettings.rowIdFn = _fnGetObjectDataFn(oInit.rowId);

				/* Browser support detection */
				_fnBrowserDetect(oSettings);

				var oClasses = oSettings.oClasses;

				$.extend(oClasses, DataTable.ext.classes, oInit.oClasses);
				$this.addClass(oClasses.sTable);


				if (oSettings.iInitDisplayStart === undefined) {
					/* Display start point, taking into account the save saving */
					oSettings.iInitDisplayStart = oInit.iDisplayStart;
					oSettings._iDisplayStart = oInit.iDisplayStart;
				}

				if (oInit.iDeferLoading !== null) {
					oSettings.bDeferLoading = true;
					var tmp = Array.isArray(oInit.iDeferLoading);
					oSettings._iRecordsDisplay = tmp ? oInit.iDeferLoading[0] : oInit.iDeferLoading;
					oSettings._iRecordsTotal = tmp ? oInit.iDeferLoading[1] : oInit.iDeferLoading;
				}

				/* Language definitions */
				var oLanguage = oSettings.oLanguage;
				$.extend(true, oLanguage, oInit.oLanguage);

				if (oLanguage.sUrl) {
					/* Get the language definitions from a file - because this Ajax call makes the language
					 * get async to the remainder of this function we use bInitHandedOff to indicate that
					 * _fnInitialise will be fired by the returned Ajax handler, rather than the constructor
					 */
					$.ajax({
						dataType: 'json',
						url: oLanguage.sUrl,
						success: function (json) {
							_fnCamelToHungarian(defaults.oLanguage, json);
							_fnLanguageCompat(json);
							$.extend(true, oLanguage, json, oSettings.oInit.oLanguage);

							_fnCallbackFire(oSettings, null, 'i18n', [oSettings]);
							_fnInitialise(oSettings);
						},
						error: function () {
							// Error occurred loading language file, continue on as best we can
							_fnInitialise(oSettings);
						}
					});
					bInitHandedOff = true;
				}
				else {
					_fnCallbackFire(oSettings, null, 'i18n', [oSettings]);
				}

				/*
				 * Stripes
				 */
				if (oInit.asStripeClasses === null) {
					oSettings.asStripeClasses = [
						oClasses.sStripeOdd,
						oClasses.sStripeEven
					];
				}

				/* Remove row stripe classes if they are already on the table row */
				var stripeClasses = oSettings.asStripeClasses;
				var rowOne = $this.children('tbody').find('tr').eq(0);
				if ($.inArray(true, $.map(stripeClasses, function (el, i) {
					return rowOne.hasClass(el);
				})) !== -1) {
					$('tbody tr', this).removeClass(stripeClasses.join(' '));
					oSettings.asDestroyStripes = stripeClasses.slice();
				}

				/*
				 * Columns
				 * See if we should load columns automatically or use defined ones
				 */
				var anThs = [];
				var aoColumnsInit;
				var nThead = this.getElementsByTagName('thead');
				if (nThead.length !== 0) {
					_fnDetectHeader(oSettings.aoHeader, nThead[0]);
					anThs = _fnGetUniqueThs(oSettings);
				}

				/* If not given a column array, generate one with nulls */
				if (oInit.aoColumns === null) {
					aoColumnsInit = [];
					for (i = 0, iLen = anThs.length; i < iLen; i++) {
						aoColumnsInit.push(null);
					}
				}
				else {
					aoColumnsInit = oInit.aoColumns;
				}

				/* Add the columns */
				for (i = 0, iLen = aoColumnsInit.length; i < iLen; i++) {
					_fnAddColumn(oSettings, anThs ? anThs[i] : null);
				}

				/* Apply the column definitions */
				_fnApplyColumnDefs(oSettings, oInit.aoColumnDefs, aoColumnsInit, function (iCol, oDef) {
					_fnColumnOptions(oSettings, iCol, oDef);
				});

				/* HTML5 attribute detection - build an mData object automatically if the
				 * attributes are found
				 */
				if (rowOne.length) {
					var a = function (cell, name) {
						return cell.getAttribute('data-' + name) !== null ? name : null;
					};

					$(rowOne[0]).children('th, td').each(function (i, cell) {
						var col = oSettings.aoColumns[i];

						if (!col) {
							_fnLog(oSettings, 0, 'Incorrect column count', 18);
						}

						if (col.mData === i) {
							var sort = a(cell, 'sort') || a(cell, 'order');
							var filter = a(cell, 'filter') || a(cell, 'search');

							if (sort !== null || filter !== null) {
								col.mData = {
									_: i + '.display',
									sort: sort !== null ? i + '.@data-' + sort : undefined,
									type: sort !== null ? i + '.@data-' + sort : undefined,
									filter: filter !== null ? i + '.@data-' + filter : undefined
								};

								_fnColumnOptions(oSettings, i);
							}
						}
					});
				}

				var features = oSettings.oFeatures;
				var loadedInit = function () {
					/*
					 * Sorting
					 * @todo For modularisation (1.11) this needs to do into a sort start up handler
					 */

					// If aaSorting is not defined, then we use the first indicator in asSorting
					// in case that has been altered, so the default sort reflects that option
					if (oInit.aaSorting === undefined) {
						var sorting = oSettings.aaSorting;
						for (i = 0, iLen = sorting.length; i < iLen; i++) {
							sorting[i][1] = oSettings.aoColumns[i].asSorting[0];
						}
					}

					/* Do a first pass on the sorting classes (allows any size changes to be taken into
					 * account, and also will apply sorting disabled classes if disabled
					 */
					_fnSortingClasses(oSettings);

					if (features.bSort) {
						_fnCallbackReg(oSettings, 'aoDrawCallback', function () {
							if (oSettings.bSorted) {
								var aSort = _fnSortFlatten(oSettings);
								var sortedColumns = {};

								$.each(aSort, function (i, val) {
									sortedColumns[val.src] = val.dir;
								});

								_fnCallbackFire(oSettings, null, 'order', [oSettings, aSort, sortedColumns]);
								_fnSortAria(oSettings);
							}
						});
					}

					_fnCallbackReg(oSettings, 'aoDrawCallback', function () {
						if (oSettings.bSorted || _fnDataSource(oSettings) === 'ssp' || features.bDeferRender) {
							_fnSortingClasses(oSettings);
						}
					}, 'sc');


					/*
					 * Final init
					 * Cache the header, body and footer as required, creating them if needed
					 */

					// Work around for Webkit bug 83867 - store the caption-side before removing from doc
					var captions = $this.children('caption').each(function () {
						this._captionSide = $(this).css('caption-side');
					});

					var thead = $this.children('thead');
					if (thead.length === 0) {
						thead = $('<thead/>').appendTo($this);
					}
					oSettings.nTHead = thead[0];

					var tbody = $this.children('tbody');
					if (tbody.length === 0) {
						tbody = $('<tbody/>').insertAfter(thead);
					}
					oSettings.nTBody = tbody[0];

					var tfoot = $this.children('tfoot');
					if (tfoot.length === 0 && captions.length > 0 && (oSettings.oScroll.sX !== "" || oSettings.oScroll.sY !== "")) {
						// If we are a scrolling table, and no footer has been given, then we need to create
						// a tfoot element for the caption element to be appended to
						tfoot = $('<tfoot/>').appendTo($this);
					}

					if (tfoot.length === 0 || tfoot.children().length === 0) {
						$this.addClass(oClasses.sNoFooter);
					}
					else if (tfoot.length > 0) {
						oSettings.nTFoot = tfoot[0];
						_fnDetectHeader(oSettings.aoFooter, oSettings.nTFoot);
					}

					/* Check if there is data passing into the constructor */
					if (oInit.aaData) {
						for (i = 0; i < oInit.aaData.length; i++) {
							_fnAddData(oSettings, oInit.aaData[i]);
						}
					}
					else if (oSettings.bDeferLoading || _fnDataSource(oSettings) == 'dom') {
						/* Grab the data from the page - only do this when deferred loading or no Ajax
						 * source since there is no point in reading the DOM data if we are then going
						 * to replace it with Ajax data
						 */
						_fnAddTr(oSettings, $(oSettings.nTBody).children('tr'));
					}

					/* Copy the data index array */
					oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();

					/* Initialisation complete - table can be drawn */
					oSettings.bInitialised = true;

					/* Check if we need to initialise the table (it might not have been handed off to the
					 * language processor)
					 */
					if (bInitHandedOff === false) {
						_fnInitialise(oSettings);
					}
				};

				/* Must be done after everything which can be overridden by the state saving! */
				_fnCallbackReg(oSettings, 'aoDrawCallback', _fnSaveState, 'state_save');

				if (oInit.bStateSave) {
					features.bStateSave = true;
					_fnLoadState(oSettings, oInit, loadedInit);
				}
				else {
					loadedInit();
				}

			});
			_that = null;
			return this;
		};


		/*
		 * It is useful to have variables which are scoped locally so only the
		 * DataTables functions can access them and they don't leak into global space.
		 * At the same time these functions are often useful over multiple files in the
		 * core and API, so we list, or at least document, all variables which are used
		 * by DataTables as private variables here. This also ensures that there is no
		 * clashing of variable names and that they can easily referenced for reuse.
		 */


		// Defined else where
		//  _selector_run
		//  _selector_opts
		//  _selector_first
		//  _selector_row_indexes

		var _ext; // DataTable.ext
		var _Api; // DataTable.Api
		var _api_register; // DataTable.Api.register
		var _api_registerPlural; // DataTable.Api.registerPlural

		var _re_dic = {};
		var _re_new_lines = /[\r\n\u2028]/g;
		var _re_html = /<.*?>/g;

		// This is not strict ISO8601 - Date.parse() is quite lax, although
		// implementations differ between browsers.
		var _re_date = /^\d{2,4}[\.\/\-]\d{1,2}[\.\/\-]\d{1,2}([T ]{1}\d{1,2}[:\.]\d{2}([\.:]\d{2})?)?$/;

		// Escape regular expression special characters
		var _re_escape_regex = new RegExp('(\\' + ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^', '-'].join('|\\') + ')', 'g');

		// http://en.wikipedia.org/wiki/Foreign_exchange_market
		// - \u20BD - Russian ruble.
		// - \u20a9 - South Korean Won
		// - \u20BA - Turkish Lira
		// - \u20B9 - Indian Rupee
		// - R - Brazil (R$) and South Africa
		// - fr - Swiss Franc
		// - kr - Swedish krona, Norwegian krone and Danish krone
		// - \u2009 is thin space and \u202F is narrow no-break space, both used in many
		// - Ƀ - Bitcoin
		// - Ξ - Ethereum
		//   standards as thousands separators.
		var _re_formatted_numeric = /['\u00A0,$£€¥%\u2009\u202F\u20BD\u20a9\u20BArfkɃΞ]/gi;


		var _empty = function (d) {
			return !d || d === true || d === '-' ? true : false;
		};


		var _intVal = function (s) {
			var integer = parseInt(s, 10);
			return !isNaN(integer) && isFinite(s) ? integer : null;
		};

		// Convert from a formatted number with characters other than `.` as the
		// decimal place, to a Javascript number
		var _numToDecimal = function (num, decimalPoint) {
			// Cache created regular expressions for speed as this function is called often
			if (!_re_dic[decimalPoint]) {
				_re_dic[decimalPoint] = new RegExp(_fnEscapeRegex(decimalPoint), 'g');
			}
			return typeof num === 'string' && decimalPoint !== '.' ?
				num.replace(/\./g, '').replace(_re_dic[decimalPoint], '.') :
				num;
		};


		var _isNumber = function (d, decimalPoint, formatted) {
			let type = typeof d;
			var strType = type === 'string';

			if (type === 'number' || type === 'bigint') {
				return true;
			}

			// If empty return immediately so there must be a number if it is a
			// formatted string (this stops the string "k", or "kr", etc being detected
			// as a formatted number for currency
			if (_empty(d)) {
				return true;
			}

			if (decimalPoint && strType) {
				d = _numToDecimal(d, decimalPoint);
			}

			if (formatted && strType) {
				d = d.replace(_re_formatted_numeric, '');
			}

			return !isNaN(parseFloat(d)) && isFinite(d);
		};


		// A string without HTML in it can be considered to be HTML still
		var _isHtml = function (d) {
			return _empty(d) || typeof d === 'string';
		};


		var _htmlNumeric = function (d, decimalPoint, formatted) {
			if (_empty(d)) {
				return true;
			}

			var html = _isHtml(d);
			return !html ?
				null :
				_isNumber(_stripHtml(d), decimalPoint, formatted) ?
					true :
					null;
		};


		var _pluck = function (a, prop, prop2) {
			var out = [];
			var i = 0, ien = a.length;

			// Could have the test in the loop for slightly smaller code, but speed
			// is essential here
			if (prop2 !== undefined) {
				for (; i < ien; i++) {
					if (a[i] && a[i][prop]) {
						out.push(a[i][prop][prop2]);
					}
				}
			}
			else {
				for (; i < ien; i++) {
					if (a[i]) {
						out.push(a[i][prop]);
					}
				}
			}

			return out;
		};


		// Basically the same as _pluck, but rather than looping over `a` we use `order`
		// as the indexes to pick from `a`
		var _pluck_order = function (a, order, prop, prop2) {
			var out = [];
			var i = 0, ien = order.length;

			// Could have the test in the loop for slightly smaller code, but speed
			// is essential here
			if (prop2 !== undefined) {
				for (; i < ien; i++) {
					if (a[order[i]][prop]) {
						out.push(a[order[i]][prop][prop2]);
					}
				}
			}
			else {
				for (; i < ien; i++) {
					out.push(a[order[i]][prop]);
				}
			}

			return out;
		};


		var _range = function (len, start) {
			var out = [];
			var end;

			if (start === undefined) {
				start = 0;
				end = len;
			}
			else {
				end = start;
				start = len;
			}

			for (var i = start; i < end; i++) {
				out.push(i);
			}

			return out;
		};


		var _removeEmpty = function (a) {
			var out = [];

			for (var i = 0, ien = a.length; i < ien; i++) {
				if (a[i]) { // careful - will remove all falsy values!
					out.push(a[i]);
				}
			}

			return out;
		};


		var _stripHtml = function (d) {
			return d.replace(_re_html, '');
		};


		/**
		 * Determine if all values in the array are unique. This means we can short
		 * cut the _unique method at the cost of a single loop. A sorted array is used
		 * to easily check the values.
		 *
		 * @param  {array} src Source array
		 * @return {boolean} true if all unique, false otherwise
		 * @ignore
		 */
		var _areAllUnique = function (src) {
			if (src.length < 2) {
				return true;
			}

			var sorted = src.slice().sort();
			var last = sorted[0];

			for (var i = 1, ien = sorted.length; i < ien; i++) {
				if (sorted[i] === last) {
					return false;
				}

				last = sorted[i];
			}

			return true;
		};


		/**
		 * Find the unique elements in a source array.
		 *
		 * @param  {array} src Source array
		 * @return {array} Array of unique items
		 * @ignore
		 */
		var _unique = function (src) {
			if (_areAllUnique(src)) {
				return src.slice();
			}

			// A faster unique method is to use object keys to identify used values,
			// but this doesn't work with arrays or objects, which we must also
			// consider. See jsperf.com/compare-array-unique-versions/4 for more
			// information.
			var
				out = [],
				val,
				i, ien = src.length,
				j, k = 0;

			again: for (i = 0; i < ien; i++) {
				val = src[i];

				for (j = 0; j < k; j++) {
					if (out[j] === val) {
						continue again;
					}
				}

				out.push(val);
				k++;
			}

			return out;
		};

		// Surprisingly this is faster than [].concat.apply
		// https://jsperf.com/flatten-an-array-loop-vs-reduce/2
		var _flatten = function (out, val) {
			if (Array.isArray(val)) {
				for (var i = 0; i < val.length; i++) {
					_flatten(out, val[i]);
				}
			}
			else {
				out.push(val);
			}

			return out;
		}

		var _includes = function (search, start) {
			if (start === undefined) {
				start = 0;
			}

			return this.indexOf(search, start) !== -1;
		};

		// Array.isArray polyfill.
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray
		if (!Array.isArray) {
			Array.isArray = function (arg) {
				return Object.prototype.toString.call(arg) === '[object Array]';
			};
		}

		if (!Array.prototype.includes) {
			Array.prototype.includes = _includes;
		}

		// .trim() polyfill
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
		if (!String.prototype.trim) {
			String.prototype.trim = function () {
				return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
			};
		}

		if (!String.prototype.includes) {
			String.prototype.includes = _includes;
		}

		/**
		 * DataTables utility methods
		 * 
		 * This namespace provides helper methods that DataTables uses internally to
		 * create a DataTable, but which are not exclusively used only for DataTables.
		 * These methods can be used by extension authors to save the duplication of
		 * code.
		 *
		 *  @namespace
		 */
		DataTable.util = {
			/**
			 * Throttle the calls to a function. Arguments and context are maintained
			 * for the throttled function.
			 *
			 * @param {function} fn Function to be called
			 * @param {integer} freq Call frequency in mS
			 * @return {function} Wrapped function
			 */
			throttle: function (fn, freq) {
				var
					frequency = freq !== undefined ? freq : 200,
					last,
					timer;

				return function () {
					var
						that = this,
						now = +new Date(),
						args = arguments;

					if (last && now < last + frequency) {
						clearTimeout(timer);

						timer = setTimeout(function () {
							last = undefined;
							fn.apply(that, args);
						}, frequency);
					}
					else {
						last = now;
						fn.apply(that, args);
					}
				};
			},


			/**
			 * Escape a string such that it can be used in a regular expression
			 *
			 *  @param {string} val string to escape
			 *  @returns {string} escaped string
			 */
			escapeRegex: function (val) {
				return val.replace(_re_escape_regex, '\\$1');
			},

			/**
			 * Create a function that will write to a nested object or array
			 * @param {*} source JSON notation string
			 * @returns Write function
			 */
			set: function (source) {
				if ($.isPlainObject(source)) {
					/* Unlike get, only the underscore (global) option is used for for
					 * setting data since we don't know the type here. This is why an object
					 * option is not documented for `mData` (which is read/write), but it is
					 * for `mRender` which is read only.
					 */
					return DataTable.util.set(source._);
				}
				else if (source === null) {
					// Nothing to do when the data source is null
					return function () { };
				}
				else if (typeof source === 'function') {
					return function (data, val, meta) {
						source(data, 'set', val, meta);
					};
				}
				else if (typeof source === 'string' && (source.indexOf('.') !== -1 ||
					source.indexOf('[') !== -1 || source.indexOf('(') !== -1)) {
					// Like the get, we need to get data from a nested object
					var setData = function (data, val, src) {
						var a = _fnSplitObjNotation(src), b;
						var aLast = a[a.length - 1];
						var arrayNotation, funcNotation, o, innerSrc;

						for (var i = 0, iLen = a.length - 1; i < iLen; i++) {
							// Protect against prototype pollution
							if (a[i] === '__proto__' || a[i] === 'constructor') {
								throw new Error('Cannot set prototype values');
							}

							// Check if we are dealing with an array notation request
							arrayNotation = a[i].match(__reArray);
							funcNotation = a[i].match(__reFn);

							if (arrayNotation) {
								a[i] = a[i].replace(__reArray, '');
								data[a[i]] = [];

								// Get the remainder of the nested object to set so we can recurse
								b = a.slice();
								b.splice(0, i + 1);
								innerSrc = b.join('.');

								// Traverse each entry in the array setting the properties requested
								if (Array.isArray(val)) {
									for (var j = 0, jLen = val.length; j < jLen; j++) {
										o = {};
										setData(o, val[j], innerSrc);
										data[a[i]].push(o);
									}
								}
								else {
									// We've been asked to save data to an array, but it
									// isn't array data to be saved. Best that can be done
									// is to just save the value.
									data[a[i]] = val;
								}

								// The inner call to setData has already traversed through the remainder
								// of the source and has set the data, thus we can exit here
								return;
							}
							else if (funcNotation) {
								// Function call
								a[i] = a[i].replace(__reFn, '');
								data = data[a[i]](val);
							}

							// If the nested object doesn't currently exist - since we are
							// trying to set the value - create it
							if (data[a[i]] === null || data[a[i]] === undefined) {
								data[a[i]] = {};
							}
							data = data[a[i]];
						}

						// Last item in the input - i.e, the actual set
						if (aLast.match(__reFn)) {
							// Function call
							data = data[aLast.replace(__reFn, '')](val);
						}
						else {
							// If array notation is used, we just want to strip it and use the property name
							// and assign the value. If it isn't used, then we get the result we want anyway
							data[aLast.replace(__reArray, '')] = val;
						}
					};

					return function (data, val) { // meta is also passed in, but not used
						return setData(data, val, source);
					};
				}
				else {
					// Array or flat object mapping
					return function (data, val) { // meta is also passed in, but not used
						data[source] = val;
					};
				}
			},

			/**
			 * Create a function that will read nested objects from arrays, based on JSON notation
			 * @param {*} source JSON notation string
			 * @returns Value read
			 */
			get: function (source) {
				if ($.isPlainObject(source)) {
					// Build an object of get functions, and wrap them in a single call
					var o = {};
					$.each(source, function (key, val) {
						if (val) {
							o[key] = DataTable.util.get(val);
						}
					});

					return function (data, type, row, meta) {
						var t = o[type] || o._;
						return t !== undefined ?
							t(data, type, row, meta) :
							data;
					};
				}
				else if (source === null) {
					// Give an empty string for rendering / sorting etc
					return function (data) { // type, row and meta also passed, but not used
						return data;
					};
				}
				else if (typeof source === 'function') {
					return function (data, type, row, meta) {
						return source(data, type, row, meta);
					};
				}
				else if (typeof source === 'string' && (source.indexOf('.') !== -1 ||
					source.indexOf('[') !== -1 || source.indexOf('(') !== -1)) {
					/* If there is a . in the source string then the data source is in a
					 * nested object so we loop over the data for each level to get the next
					 * level down. On each loop we test for undefined, and if found immediately
					 * return. This allows entire objects to be missing and sDefaultContent to
					 * be used if defined, rather than throwing an error
					 */
					var fetchData = function (data, type, src) {
						var arrayNotation, funcNotation, out, innerSrc;

						if (src !== "") {
							var a = _fnSplitObjNotation(src);

							for (var i = 0, iLen = a.length; i < iLen; i++) {
								// Check if we are dealing with special notation
								arrayNotation = a[i].match(__reArray);
								funcNotation = a[i].match(__reFn);

								if (arrayNotation) {
									// Array notation
									a[i] = a[i].replace(__reArray, '');

									// Condition allows simply [] to be passed in
									if (a[i] !== "") {
										data = data[a[i]];
									}
									out = [];

									// Get the remainder of the nested object to get
									a.splice(0, i + 1);
									innerSrc = a.join('.');

									// Traverse each entry in the array getting the properties requested
									if (Array.isArray(data)) {
										for (var j = 0, jLen = data.length; j < jLen; j++) {
											out.push(fetchData(data[j], type, innerSrc));
										}
									}

									// If a string is given in between the array notation indicators, that
									// is used to join the strings together, otherwise an array is returned
									var join = arrayNotation[0].substring(1, arrayNotation[0].length - 1);
									data = (join === "") ? out : out.join(join);

									// The inner call to fetchData has already traversed through the remainder
									// of the source requested, so we exit from the loop
									break;
								}
								else if (funcNotation) {
									// Function call
									a[i] = a[i].replace(__reFn, '');
									data = data[a[i]]();
									continue;
								}

								if (data === null || data[a[i]] === undefined) {
									return undefined;
								}

								data = data[a[i]];
							}
						}

						return data;
					};

					return function (data, type) { // row and meta also passed, but not used
						return fetchData(data, type, source);
					};
				}
				else {
					// Array or flat object mapping
					return function (data, type) { // row and meta also passed, but not used
						return data[source];
					};
				}
			}
		};



		/**
		 * Create a mapping object that allows camel case parameters to be looked up
		 * for their Hungarian counterparts. The mapping is stored in a private
		 * parameter called `_hungarianMap` which can be accessed on the source object.
		 *  @param {object} o
		 *  @memberof DataTable#oApi
		 */
		function _fnHungarianMap(o) {
			var
				hungarian = 'a aa ai ao as b fn i m o s ',
				match,
				newKey,
				map = {};

			$.each(o, function (key, val) {
				match = key.match(/^([^A-Z]+?)([A-Z])/);

				if (match && hungarian.indexOf(match[1] + ' ') !== -1) {
					newKey = key.replace(match[0], match[2].toLowerCase());
					map[newKey] = key;

					if (match[1] === 'o') {
						_fnHungarianMap(o[key]);
					}
				}
			});

			o._hungarianMap = map;
		}


		/**
		 * Convert from camel case parameters to Hungarian, based on a Hungarian map
		 * created by _fnHungarianMap.
		 *  @param {object} src The model object which holds all parameters that can be
		 *    mapped.
		 *  @param {object} user The object to convert from camel case to Hungarian.
		 *  @param {boolean} force When set to `true`, properties which already have a
		 *    Hungarian value in the `user` object will be overwritten. Otherwise they
		 *    won't be.
		 *  @memberof DataTable#oApi
		 */
		function _fnCamelToHungarian(src, user, force) {
			if (!src._hungarianMap) {
				_fnHungarianMap(src);
			}

			var hungarianKey;

			$.each(user, function (key, val) {
				hungarianKey = src._hungarianMap[key];

				if (hungarianKey !== undefined && (force || user[hungarianKey] === undefined)) {
					// For objects, we need to buzz down into the object to copy parameters
					if (hungarianKey.charAt(0) === 'o') {
						// Copy the camelCase options over to the hungarian
						if (!user[hungarianKey]) {
							user[hungarianKey] = {};
						}
						$.extend(true, user[hungarianKey], user[key]);

						_fnCamelToHungarian(src[hungarianKey], user[hungarianKey], force);
					}
					else {
						user[hungarianKey] = user[key];
					}
				}
			});
		}


		/**
		 * Language compatibility - when certain options are given, and others aren't, we
		 * need to duplicate the values over, in order to provide backwards compatibility
		 * with older language files.
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnLanguageCompat(lang) {
			// Note the use of the Hungarian notation for the parameters in this method as
			// this is called after the mapping of camelCase to Hungarian
			var defaults = DataTable.defaults.oLanguage;

			// Default mapping
			var defaultDecimal = defaults.sDecimal;
			if (defaultDecimal) {
				_addNumericSort(defaultDecimal);
			}

			if (lang) {
				var zeroRecords = lang.sZeroRecords;

				// Backwards compatibility - if there is no sEmptyTable given, then use the same as
				// sZeroRecords - assuming that is given.
				if (!lang.sEmptyTable && zeroRecords &&
					defaults.sEmptyTable === "No data available in table") {
					_fnMap(lang, lang, 'sZeroRecords', 'sEmptyTable');
				}

				// Likewise with loading records
				if (!lang.sLoadingRecords && zeroRecords &&
					defaults.sLoadingRecords === "Loading...") {
					_fnMap(lang, lang, 'sZeroRecords', 'sLoadingRecords');
				}

				// Old parameter name of the thousands separator mapped onto the new
				if (lang.sInfoThousands) {
					lang.sThousands = lang.sInfoThousands;
				}

				var decimal = lang.sDecimal;
				if (decimal && defaultDecimal !== decimal) {
					_addNumericSort(decimal);
				}
			}
		}


		/**
		 * Map one parameter onto another
		 *  @param {object} o Object to map
		 *  @param {*} knew The new parameter name
		 *  @param {*} old The old parameter name
		 */
		var _fnCompatMap = function (o, knew, old) {
			if (o[knew] !== undefined) {
				o[old] = o[knew];
			}
		};


		/**
		 * Provide backwards compatibility for the main DT options. Note that the new
		 * options are mapped onto the old parameters, so this is an external interface
		 * change only.
		 *  @param {object} init Object to map
		 */
		function _fnCompatOpts(init) {
			_fnCompatMap(init, 'ordering', 'bSort');
			_fnCompatMap(init, 'orderMulti', 'bSortMulti');
			_fnCompatMap(init, 'orderClasses', 'bSortClasses');
			_fnCompatMap(init, 'orderCellsTop', 'bSortCellsTop');
			_fnCompatMap(init, 'order', 'aaSorting');
			_fnCompatMap(init, 'orderFixed', 'aaSortingFixed');
			_fnCompatMap(init, 'paging', 'bPaginate');
			_fnCompatMap(init, 'pagingType', 'sPaginationType');
			_fnCompatMap(init, 'pageLength', 'iDisplayLength');
			_fnCompatMap(init, 'searching', 'bFilter');

			// Boolean initialisation of x-scrolling
			if (typeof init.sScrollX === 'boolean') {
				init.sScrollX = init.sScrollX ? '100%' : '';
			}
			if (typeof init.scrollX === 'boolean') {
				init.scrollX = init.scrollX ? '100%' : '';
			}

			// Column search objects are in an array, so it needs to be converted
			// element by element
			var searchCols = init.aoSearchCols;

			if (searchCols) {
				for (var i = 0, ien = searchCols.length; i < ien; i++) {
					if (searchCols[i]) {
						_fnCamelToHungarian(DataTable.models.oSearch, searchCols[i]);
					}
				}
			}
		}


		/**
		 * Provide backwards compatibility for column options. Note that the new options
		 * are mapped onto the old parameters, so this is an external interface change
		 * only.
		 *  @param {object} init Object to map
		 */
		function _fnCompatCols(init) {
			_fnCompatMap(init, 'orderable', 'bSortable');
			_fnCompatMap(init, 'orderData', 'aDataSort');
			_fnCompatMap(init, 'orderSequence', 'asSorting');
			_fnCompatMap(init, 'orderDataType', 'sortDataType');

			// orderData can be given as an integer
			var dataSort = init.aDataSort;
			if (typeof dataSort === 'number' && !Array.isArray(dataSort)) {
				init.aDataSort = [dataSort];
			}
		}


		/**
		 * Browser feature detection for capabilities, quirks
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnBrowserDetect(settings) {
			// We don't need to do this every time DataTables is constructed, the values
			// calculated are specific to the browser and OS configuration which we
			// don't expect to change between initialisations
			if (!DataTable.__browser) {
				var browser = {};
				DataTable.__browser = browser;

				// Scrolling feature / quirks detection
				var n = $('<div/>')
					.css({
						position: 'fixed',
						top: 0,
						left: $(window).scrollLeft() * -1, // allow for scrolling
						height: 1,
						width: 1,
						overflow: 'hidden'
					})
					.append(
						$('<div/>')
							.css({
								position: 'absolute',
								top: 1,
								left: 1,
								width: 100,
								overflow: 'scroll'
							})
							.append(
								$('<div/>')
									.css({
										width: '100%',
										height: 10
									})
							)
					)
					.appendTo('body');

				var outer = n.children();
				var inner = outer.children();

				// Numbers below, in order, are:
				// inner.offsetWidth, inner.clientWidth, outer.offsetWidth, outer.clientWidth
				//
				// IE6 XP:                           100 100 100  83
				// IE7 Vista:                        100 100 100  83
				// IE 8+ Windows:                     83  83 100  83
				// Evergreen Windows:                 83  83 100  83
				// Evergreen Mac with scrollbars:     85  85 100  85
				// Evergreen Mac without scrollbars: 100 100 100 100

				// Get scrollbar width
				browser.barWidth = outer[0].offsetWidth - outer[0].clientWidth;

				// IE6/7 will oversize a width 100% element inside a scrolling element, to
				// include the width of the scrollbar, while other browsers ensure the inner
				// element is contained without forcing scrolling
				browser.bScrollOversize = inner[0].offsetWidth === 100 && outer[0].clientWidth !== 100;

				// In rtl text layout, some browsers (most, but not all) will place the
				// scrollbar on the left, rather than the right.
				browser.bScrollbarLeft = Math.round(inner.offset().left) !== 1;

				// IE8- don't provide height and width for getBoundingClientRect
				browser.bBounding = n[0].getBoundingClientRect().width ? true : false;

				n.remove();
			}

			$.extend(settings.oBrowser, DataTable.__browser);
			settings.oScroll.iBarWidth = DataTable.__browser.barWidth;
		}


		/**
		 * Array.prototype reduce[Right] method, used for browsers which don't support
		 * JS 1.6. Done this way to reduce code size, since we iterate either way
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnReduce(that, fn, init, start, end, inc) {
			var
				i = start,
				value,
				isSet = false;

			if (init !== undefined) {
				value = init;
				isSet = true;
			}

			while (i !== end) {
				if (!that.hasOwnProperty(i)) {
					continue;
				}

				value = isSet ?
					fn(value, that[i], i, that) :
					that[i];

				isSet = true;
				i += inc;
			}

			return value;
		}

		/**
		 * Add a column to the list used for the table with default values
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} nTh The th element for this column
		 *  @memberof DataTable#oApi
		 */
		function _fnAddColumn(oSettings, nTh) {
			// Add column to aoColumns array
			var oDefaults = DataTable.defaults.column;
			var iCol = oSettings.aoColumns.length;
			var oCol = $.extend({}, DataTable.models.oColumn, oDefaults, {
				"nTh": nTh ? nTh : document.createElement('th'),
				"sTitle": oDefaults.sTitle ? oDefaults.sTitle : nTh ? nTh.innerHTML : '',
				"aDataSort": oDefaults.aDataSort ? oDefaults.aDataSort : [iCol],
				"mData": oDefaults.mData ? oDefaults.mData : iCol,
				idx: iCol
			});
			oSettings.aoColumns.push(oCol);

			// Add search object for column specific search. Note that the `searchCols[ iCol ]`
			// passed into extend can be undefined. This allows the user to give a default
			// with only some of the parameters defined, and also not give a default
			var searchCols = oSettings.aoPreSearchCols;
			searchCols[iCol] = $.extend({}, DataTable.models.oSearch, searchCols[iCol]);

			// Use the default column options function to initialise classes etc
			_fnColumnOptions(oSettings, iCol, $(nTh).data());
		}


		/**
		 * Apply options for a column
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iCol column index to consider
		 *  @param {object} oOptions object with sType, bVisible and bSearchable etc
		 *  @memberof DataTable#oApi
		 */
		function _fnColumnOptions(oSettings, iCol, oOptions) {
			var oCol = oSettings.aoColumns[iCol];
			var oClasses = oSettings.oClasses;
			var th = $(oCol.nTh);

			// Try to get width information from the DOM. We can't get it from CSS
			// as we'd need to parse the CSS stylesheet. `width` option can override
			if (!oCol.sWidthOrig) {
				// Width attribute
				oCol.sWidthOrig = th.attr('width') || null;

				// Style attribute
				var t = (th.attr('style') || '').match(/width:\s*(\d+[pxem%]+)/);
				if (t) {
					oCol.sWidthOrig = t[1];
				}
			}

			/* User specified column options */
			if (oOptions !== undefined && oOptions !== null) {
				// Backwards compatibility
				_fnCompatCols(oOptions);

				// Map camel case parameters to their Hungarian counterparts
				_fnCamelToHungarian(DataTable.defaults.column, oOptions, true);

				/* Backwards compatibility for mDataProp */
				if (oOptions.mDataProp !== undefined && !oOptions.mData) {
					oOptions.mData = oOptions.mDataProp;
				}

				if (oOptions.sType) {
					oCol._sManualType = oOptions.sType;
				}

				// `class` is a reserved word in Javascript, so we need to provide
				// the ability to use a valid name for the camel case input
				if (oOptions.className && !oOptions.sClass) {
					oOptions.sClass = oOptions.className;
				}
				if (oOptions.sClass) {
					th.addClass(oOptions.sClass);
				}

				var origClass = oCol.sClass;

				$.extend(oCol, oOptions);
				_fnMap(oCol, oOptions, "sWidth", "sWidthOrig");

				// Merge class from previously defined classes with this one, rather than just
				// overwriting it in the extend above
				if (origClass !== oCol.sClass) {
					oCol.sClass = origClass + ' ' + oCol.sClass;
				}

				/* iDataSort to be applied (backwards compatibility), but aDataSort will take
				 * priority if defined
				 */
				if (oOptions.iDataSort !== undefined) {
					oCol.aDataSort = [oOptions.iDataSort];
				}
				_fnMap(oCol, oOptions, "aDataSort");
			}

			/* Cache the data get and set functions for speed */
			var mDataSrc = oCol.mData;
			var mData = _fnGetObjectDataFn(mDataSrc);
			var mRender = oCol.mRender ? _fnGetObjectDataFn(oCol.mRender) : null;

			var attrTest = function (src) {
				return typeof src === 'string' && src.indexOf('@') !== -1;
			};
			oCol._bAttrSrc = $.isPlainObject(mDataSrc) && (
				attrTest(mDataSrc.sort) || attrTest(mDataSrc.type) || attrTest(mDataSrc.filter)
			);
			oCol._setter = null;

			oCol.fnGetData = function (rowData, type, meta) {
				var innerData = mData(rowData, type, undefined, meta);

				return mRender && type ?
					mRender(innerData, type, rowData, meta) :
					innerData;
			};
			oCol.fnSetData = function (rowData, val, meta) {
				return _fnSetObjectDataFn(mDataSrc)(rowData, val, meta);
			};

			// Indicate if DataTables should read DOM data as an object or array
			// Used in _fnGetRowElements
			if (typeof mDataSrc !== 'number') {
				oSettings._rowReadObject = true;
			}

			/* Feature sorting overrides column specific when off */
			if (!oSettings.oFeatures.bSort) {
				oCol.bSortable = false;
				th.addClass(oClasses.sSortableNone); // Have to add class here as order event isn't called
			}

			/* Check that the class assignment is correct for sorting */
			var bAsc = $.inArray('asc', oCol.asSorting) !== -1;
			var bDesc = $.inArray('desc', oCol.asSorting) !== -1;
			if (!oCol.bSortable || (!bAsc && !bDesc)) {
				oCol.sSortingClass = oClasses.sSortableNone;
				oCol.sSortingClassJUI = "";
			}
			else if (bAsc && !bDesc) {
				oCol.sSortingClass = oClasses.sSortableAsc;
				oCol.sSortingClassJUI = oClasses.sSortJUIAscAllowed;
			}
			else if (!bAsc && bDesc) {
				oCol.sSortingClass = oClasses.sSortableDesc;
				oCol.sSortingClassJUI = oClasses.sSortJUIDescAllowed;
			}
			else {
				oCol.sSortingClass = oClasses.sSortable;
				oCol.sSortingClassJUI = oClasses.sSortJUI;
			}
		}


		/**
		 * Adjust the table column widths for new data. Note: you would probably want to
		 * do a redraw after calling this function!
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnAdjustColumnSizing(settings) {
			/* Not interested in doing column width calculation if auto-width is disabled */
			if (settings.oFeatures.bAutoWidth !== false) {
				var columns = settings.aoColumns;

				_fnCalculateColumnWidths(settings);
				for (var i = 0, iLen = columns.length; i < iLen; i++) {
					columns[i].nTh.style.width = columns[i].sWidth;
				}
			}

			var scroll = settings.oScroll;
			if (scroll.sY !== '' || scroll.sX !== '') {
				_fnScrollDraw(settings);
			}

			_fnCallbackFire(settings, null, 'column-sizing', [settings]);
		}


		/**
		 * Convert the index of a visible column to the index in the data array (take account
		 * of hidden columns)
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iMatch Visible column index to lookup
		 *  @returns {int} i the data index
		 *  @memberof DataTable#oApi
		 */
		function _fnVisibleToColumnIndex(oSettings, iMatch) {
			var aiVis = _fnGetColumns(oSettings, 'bVisible');

			return typeof aiVis[iMatch] === 'number' ?
				aiVis[iMatch] :
				null;
		}


		/**
		 * Convert the index of an index in the data array and convert it to the visible
		 *   column index (take account of hidden columns)
		 *  @param {int} iMatch Column index to lookup
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {int} i the data index
		 *  @memberof DataTable#oApi
		 */
		function _fnColumnIndexToVisible(oSettings, iMatch) {
			var aiVis = _fnGetColumns(oSettings, 'bVisible');
			var iPos = $.inArray(iMatch, aiVis);

			return iPos !== -1 ? iPos : null;
		}


		/**
		 * Get the number of visible columns
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {int} i the number of visible columns
		 *  @memberof DataTable#oApi
		 */
		function _fnVisbleColumns(oSettings) {
			var vis = 0;

			// No reduce in IE8, use a loop for now
			$.each(oSettings.aoColumns, function (i, col) {
				if (col.bVisible && $(col.nTh).css('display') !== 'none') {
					vis++;
				}
			});

			return vis;
		}


		/**
		 * Get an array of column indexes that match a given property
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sParam Parameter in aoColumns to look for - typically
		 *    bVisible or bSearchable
		 *  @returns {array} Array of indexes with matched properties
		 *  @memberof DataTable#oApi
		 */
		function _fnGetColumns(oSettings, sParam) {
			var a = [];

			$.map(oSettings.aoColumns, function (val, i) {
				if (val[sParam]) {
					a.push(i);
				}
			});

			return a;
		}


		/**
		 * Calculate the 'type' of a column
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnColumnTypes(settings) {
			var columns = settings.aoColumns;
			var data = settings.aoData;
			var types = DataTable.ext.type.detect;
			var i, ien, j, jen, k, ken;
			var col, cell, detectedType, cache;

			// For each column, spin over the 
			for (i = 0, ien = columns.length; i < ien; i++) {
				col = columns[i];
				cache = [];

				if (!col.sType && col._sManualType) {
					col.sType = col._sManualType;
				}
				else if (!col.sType) {
					for (j = 0, jen = types.length; j < jen; j++) {
						for (k = 0, ken = data.length; k < ken; k++) {
							// Use a cache array so we only need to get the type data
							// from the formatter once (when using multiple detectors)
							if (cache[k] === undefined) {
								cache[k] = _fnGetCellData(settings, k, i, 'type');
							}

							detectedType = types[j](cache[k], settings);

							// If null, then this type can't apply to this column, so
							// rather than testing all cells, break out. There is an
							// exception for the last type which is `html`. We need to
							// scan all rows since it is possible to mix string and HTML
							// types
							if (!detectedType && j !== types.length - 1) {
								break;
							}

							// Only a single match is needed for html type since it is
							// bottom of the pile and very similar to string - but it
							// must not be empty
							if (detectedType === 'html' && !_empty(cache[k])) {
								break;
							}
						}

						// Type is valid for all data points in the column - use this
						// type
						if (detectedType) {
							col.sType = detectedType;
							break;
						}
					}

					// Fall back - if no type was detected, always use string
					if (!col.sType) {
						col.sType = 'string';
					}
				}
			}
		}


		/**
		 * Take the column definitions and static columns arrays and calculate how
		 * they relate to column indexes. The callback function will then apply the
		 * definition found for a column to a suitable configuration object.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {array} aoColDefs The aoColumnDefs array that is to be applied
		 *  @param {array} aoCols The aoColumns array that defines columns individually
		 *  @param {function} fn Callback function - takes two parameters, the calculated
		 *    column index and the definition for that column.
		 *  @memberof DataTable#oApi
		 */
		function _fnApplyColumnDefs(oSettings, aoColDefs, aoCols, fn) {
			var i, iLen, j, jLen, k, kLen, def;
			var columns = oSettings.aoColumns;

			// Column definitions with aTargets
			if (aoColDefs) {
				/* Loop over the definitions array - loop in reverse so first instance has priority */
				for (i = aoColDefs.length - 1; i >= 0; i--) {
					def = aoColDefs[i];

					/* Each definition can target multiple columns, as it is an array */
					var aTargets = def.target !== undefined
						? def.target
						: def.targets !== undefined
							? def.targets
							: def.aTargets;

					if (!Array.isArray(aTargets)) {
						aTargets = [aTargets];
					}

					for (j = 0, jLen = aTargets.length; j < jLen; j++) {
						if (typeof aTargets[j] === 'number' && aTargets[j] >= 0) {
							/* Add columns that we don't yet know about */
							while (columns.length <= aTargets[j]) {
								_fnAddColumn(oSettings);
							}

							/* Integer, basic index */
							fn(aTargets[j], def);
						}
						else if (typeof aTargets[j] === 'number' && aTargets[j] < 0) {
							/* Negative integer, right to left column counting */
							fn(columns.length + aTargets[j], def);
						}
						else if (typeof aTargets[j] === 'string') {
							/* Class name matching on TH element */
							for (k = 0, kLen = columns.length; k < kLen; k++) {
								if (aTargets[j] == "_all" ||
									$(columns[k].nTh).hasClass(aTargets[j])) {
									fn(k, def);
								}
							}
						}
					}
				}
			}

			// Statically defined columns array
			if (aoCols) {
				for (i = 0, iLen = aoCols.length; i < iLen; i++) {
					fn(i, aoCols[i]);
				}
			}
		}

		/**
		 * Add a data array to the table, creating DOM node etc. This is the parallel to
		 * _fnGatherData, but for adding rows from a Javascript source, rather than a
		 * DOM source.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {array} aData data array to be added
		 *  @param {node} [nTr] TR element to add to the table - optional. If not given,
		 *    DataTables will create a row automatically
		 *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
		 *    if nTr is.
		 *  @returns {int} >=0 if successful (index of new aoData entry), -1 if failed
		 *  @memberof DataTable#oApi
		 */
		function _fnAddData(oSettings, aDataIn, nTr, anTds) {
			/* Create the object for storing information about this new row */
			var iRow = oSettings.aoData.length;
			var oData = $.extend(true, {}, DataTable.models.oRow, {
				src: nTr ? 'dom' : 'data',
				idx: iRow
			});

			oData._aData = aDataIn;
			oSettings.aoData.push(oData);

			/* Create the cells */
			var nTd, sThisType;
			var columns = oSettings.aoColumns;

			// Invalidate the column types as the new data needs to be revalidated
			for (var i = 0, iLen = columns.length; i < iLen; i++) {
				columns[i].sType = null;
			}

			/* Add to the display array */
			oSettings.aiDisplayMaster.push(iRow);

			var id = oSettings.rowIdFn(aDataIn);
			if (id !== undefined) {
				oSettings.aIds[id] = oData;
			}

			/* Create the DOM information, or register it if already present */
			if (nTr || !oSettings.oFeatures.bDeferRender) {
				_fnCreateTr(oSettings, iRow, nTr, anTds);
			}

			return iRow;
		}


		/**
		 * Add one or more TR elements to the table. Generally we'd expect to
		 * use this for reading data from a DOM sourced table, but it could be
		 * used for an TR element. Note that if a TR is given, it is used (i.e.
		 * it is not cloned).
		 *  @param {object} settings dataTables settings object
		 *  @param {array|node|jQuery} trs The TR element(s) to add to the table
		 *  @returns {array} Array of indexes for the added rows
		 *  @memberof DataTable#oApi
		 */
		function _fnAddTr(settings, trs) {
			var row;

			// Allow an individual node to be passed in
			if (!(trs instanceof $)) {
				trs = $(trs);
			}

			return trs.map(function (i, el) {
				row = _fnGetRowElements(settings, el);
				return _fnAddData(settings, row.data, el, row.cells);
			});
		}


		/**
		 * Take a TR element and convert it to an index in aoData
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} n the TR element to find
		 *  @returns {int} index if the node is found, null if not
		 *  @memberof DataTable#oApi
		 */
		function _fnNodeToDataIndex(oSettings, n) {
			return (n._DT_RowIndex !== undefined) ? n._DT_RowIndex : null;
		}


		/**
		 * Take a TD element and convert it into a column data index (not the visible index)
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow The row number the TD/TH can be found in
		 *  @param {node} n The TD/TH element to find
		 *  @returns {int} index if the node is found, -1 if not
		 *  @memberof DataTable#oApi
		 */
		function _fnNodeToColumnIndex(oSettings, iRow, n) {
			return $.inArray(n, oSettings.aoData[iRow].anCells);
		}


		/**
		 * Get the data for a given cell from the internal cache, taking into account data mapping
		 *  @param {object} settings dataTables settings object
		 *  @param {int} rowIdx aoData row id
		 *  @param {int} colIdx Column index
		 *  @param {string} type data get type ('display', 'type' 'filter|search' 'sort|order')
		 *  @returns {*} Cell data
		 *  @memberof DataTable#oApi
		 */
		function _fnGetCellData(settings, rowIdx, colIdx, type) {
			if (type === 'search') {
				type = 'filter';
			}
			else if (type === 'order') {
				type = 'sort';
			}

			var draw = settings.iDraw;
			var col = settings.aoColumns[colIdx];
			var rowData = settings.aoData[rowIdx]._aData;
			var defaultContent = col.sDefaultContent;
			var cellData = col.fnGetData(rowData, type, {
				settings: settings,
				row: rowIdx,
				col: colIdx
			});

			if (cellData === undefined) {
				if (settings.iDrawError != draw && defaultContent === null) {
					_fnLog(settings, 0, "Requested unknown parameter " +
						(typeof col.mData == 'function' ? '{function}' : "'" + col.mData + "'") +
						" for row " + rowIdx + ", column " + colIdx, 4);
					settings.iDrawError = draw;
				}
				return defaultContent;
			}

			// When the data source is null and a specific data type is requested (i.e.
			// not the original data), we can use default column data
			if ((cellData === rowData || cellData === null) && defaultContent !== null && type !== undefined) {
				cellData = defaultContent;
			}
			else if (typeof cellData === 'function') {
				// If the data source is a function, then we run it and use the return,
				// executing in the scope of the data object (for instances)
				return cellData.call(rowData);
			}

			if (cellData === null && type === 'display') {
				return '';
			}

			if (type === 'filter') {
				var fomatters = DataTable.ext.type.search;

				if (fomatters[col.sType]) {
					cellData = fomatters[col.sType](cellData);
				}
			}

			return cellData;
		}


		/**
		 * Set the value for a specific cell, into the internal data cache
		 *  @param {object} settings dataTables settings object
		 *  @param {int} rowIdx aoData row id
		 *  @param {int} colIdx Column index
		 *  @param {*} val Value to set
		 *  @memberof DataTable#oApi
		 */
		function _fnSetCellData(settings, rowIdx, colIdx, val) {
			var col = settings.aoColumns[colIdx];
			var rowData = settings.aoData[rowIdx]._aData;

			col.fnSetData(rowData, val, {
				settings: settings,
				row: rowIdx,
				col: colIdx
			});
		}


		// Private variable that is used to match action syntax in the data property object
		var __reArray = /\[.*?\]$/;
		var __reFn = /\(\)$/;

		/**
		 * Split string on periods, taking into account escaped periods
		 * @param  {string} str String to split
		 * @return {array} Split string
		 */
		function _fnSplitObjNotation(str) {
			return $.map(str.match(/(\\.|[^\.])+/g) || [''], function (s) {
				return s.replace(/\\\./g, '.');
			});
		}


		/**
		 * Return a function that can be used to get data from a source object, taking
		 * into account the ability to use nested objects as a source
		 *  @param {string|int|function} mSource The data source for the object
		 *  @returns {function} Data get function
		 *  @memberof DataTable#oApi
		 */
		var _fnGetObjectDataFn = DataTable.util.get;


		/**
		 * Return a function that can be used to set data from a source object, taking
		 * into account the ability to use nested objects as a source
		 *  @param {string|int|function} mSource The data source for the object
		 *  @returns {function} Data set function
		 *  @memberof DataTable#oApi
		 */
		var _fnSetObjectDataFn = DataTable.util.set;


		/**
		 * Return an array with the full table data
		 *  @param {object} oSettings dataTables settings object
		 *  @returns array {array} aData Master data array
		 *  @memberof DataTable#oApi
		 */
		function _fnGetDataMaster(settings) {
			return _pluck(settings.aoData, '_aData');
		}


		/**
		 * Nuke the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnClearTable(settings) {
			settings.aoData.length = 0;
			settings.aiDisplayMaster.length = 0;
			settings.aiDisplay.length = 0;
			settings.aIds = {};
		}


		/**
		* Take an array of integers (index array) and remove a target integer (value - not
		* the key!)
		*  @param {array} a Index array to target
		*  @param {int} iTarget value to find
		*  @memberof DataTable#oApi
		*/
		function _fnDeleteIndex(a, iTarget, splice) {
			var iTargetIndex = -1;

			for (var i = 0, iLen = a.length; i < iLen; i++) {
				if (a[i] == iTarget) {
					iTargetIndex = i;
				}
				else if (a[i] > iTarget) {
					a[i]--;
				}
			}

			if (iTargetIndex != -1 && splice === undefined) {
				a.splice(iTargetIndex, 1);
			}
		}


		/**
		 * Mark cached data as invalid such that a re-read of the data will occur when
		 * the cached data is next requested. Also update from the data source object.
		 *
		 * @param {object} settings DataTables settings object
		 * @param {int}    rowIdx   Row index to invalidate
		 * @param {string} [src]    Source to invalidate from: undefined, 'auto', 'dom'
		 *     or 'data'
		 * @param {int}    [colIdx] Column index to invalidate. If undefined the whole
		 *     row will be invalidated
		 * @memberof DataTable#oApi
		 *
		 * @todo For the modularisation of v1.11 this will need to become a callback, so
		 *   the sort and filter methods can subscribe to it. That will required
		 *   initialisation options for sorting, which is why it is not already baked in
		 */
		function _fnInvalidate(settings, rowIdx, src, colIdx) {
			var row = settings.aoData[rowIdx];
			var i, ien;
			var cellWrite = function (cell, col) {
				// This is very frustrating, but in IE if you just write directly
				// to innerHTML, and elements that are overwritten are GC'ed,
				// even if there is a reference to them elsewhere
				while (cell.childNodes.length) {
					cell.removeChild(cell.firstChild);
				}

				cell.innerHTML = _fnGetCellData(settings, rowIdx, col, 'display');
			};

			// Are we reading last data from DOM or the data object?
			if (src === 'dom' || ((!src || src === 'auto') && row.src === 'dom')) {
				// Read the data from the DOM
				row._aData = _fnGetRowElements(
					settings, row, colIdx, colIdx === undefined ? undefined : row._aData
				)
					.data;
			}
			else {
				// Reading from data object, update the DOM
				var cells = row.anCells;

				if (cells) {
					if (colIdx !== undefined) {
						cellWrite(cells[colIdx], colIdx);
					}
					else {
						for (i = 0, ien = cells.length; i < ien; i++) {
							cellWrite(cells[i], i);
						}
					}
				}
			}

			// For both row and cell invalidation, the cached data for sorting and
			// filtering is nulled out
			row._aSortData = null;
			row._aFilterData = null;

			// Invalidate the type for a specific column (if given) or all columns since
			// the data might have changed
			var cols = settings.aoColumns;
			if (colIdx !== undefined) {
				cols[colIdx].sType = null;
			}
			else {
				for (i = 0, ien = cols.length; i < ien; i++) {
					cols[i].sType = null;
				}

				// Update DataTables special `DT_*` attributes for the row
				_fnRowAttributes(settings, row);
			}
		}


		/**
		 * Build a data source object from an HTML row, reading the contents of the
		 * cells that are in the row.
		 *
		 * @param {object} settings DataTables settings object
		 * @param {node|object} TR element from which to read data or existing row
		 *   object from which to re-read the data from the cells
		 * @param {int} [colIdx] Optional column index
		 * @param {array|object} [d] Data source object. If `colIdx` is given then this
		 *   parameter should also be given and will be used to write the data into.
		 *   Only the column in question will be written
		 * @returns {object} Object with two parameters: `data` the data read, in
		 *   document order, and `cells` and array of nodes (they can be useful to the
		 *   caller, so rather than needing a second traversal to get them, just return
		 *   them from here).
		 * @memberof DataTable#oApi
		 */
		function _fnGetRowElements(settings, row, colIdx, d) {
			var
				tds = [],
				td = row.firstChild,
				name, col, o, i = 0, contents,
				columns = settings.aoColumns,
				objectRead = settings._rowReadObject;

			// Allow the data object to be passed in, or construct
			d = d !== undefined ?
				d :
				objectRead ?
					{} :
					[];

			var attr = function (str, td) {
				if (typeof str === 'string') {
					var idx = str.indexOf('@');

					if (idx !== -1) {
						var attr = str.substring(idx + 1);
						var setter = _fnSetObjectDataFn(str);
						setter(d, td.getAttribute(attr));
					}
				}
			};

			// Read data from a cell and store into the data object
			var cellProcess = function (cell) {
				if (colIdx === undefined || colIdx === i) {
					col = columns[i];
					contents = (cell.innerHTML).trim();

					if (col && col._bAttrSrc) {
						var setter = _fnSetObjectDataFn(col.mData._);
						setter(d, contents);

						attr(col.mData.sort, cell);
						attr(col.mData.type, cell);
						attr(col.mData.filter, cell);
					}
					else {
						// Depending on the `data` option for the columns the data can
						// be read to either an object or an array.
						if (objectRead) {
							if (!col._setter) {
								// Cache the setter function
								col._setter = _fnSetObjectDataFn(col.mData);
							}
							col._setter(d, contents);
						}
						else {
							d[i] = contents;
						}
					}
				}

				i++;
			};

			if (td) {
				// `tr` element was passed in
				while (td) {
					name = td.nodeName.toUpperCase();

					if (name == "TD" || name == "TH") {
						cellProcess(td);
						tds.push(td);
					}

					td = td.nextSibling;
				}
			}
			else {
				// Existing row object passed in
				tds = row.anCells;

				for (var j = 0, jen = tds.length; j < jen; j++) {
					cellProcess(tds[j]);
				}
			}

			// Read the ID from the DOM if present
			var rowNode = row.firstChild ? row : row.nTr;

			if (rowNode) {
				var id = rowNode.getAttribute('id');

				if (id) {
					_fnSetObjectDataFn(settings.rowId)(d, id);
				}
			}

			return {
				data: d,
				cells: tds
			};
		}
		/**
		 * Create a new TR element (and it's TD children) for a row
		 *  @param {object} oSettings dataTables settings object
		 *  @param {int} iRow Row to consider
		 *  @param {node} [nTrIn] TR element to add to the table - optional. If not given,
		 *    DataTables will create a row automatically
		 *  @param {array} [anTds] Array of TD|TH elements for the row - must be given
		 *    if nTr is.
		 *  @memberof DataTable#oApi
		 */
		function _fnCreateTr(oSettings, iRow, nTrIn, anTds) {
			var
				row = oSettings.aoData[iRow],
				rowData = row._aData,
				cells = [],
				nTr, nTd, oCol,
				i, iLen, create;

			if (row.nTr === null) {
				nTr = nTrIn || document.createElement('tr');

				row.nTr = nTr;
				row.anCells = cells;

				/* Use a private property on the node to allow reserve mapping from the node
				 * to the aoData array for fast look up
				 */
				nTr._DT_RowIndex = iRow;

				/* Special parameters can be given by the data source to be used on the row */
				_fnRowAttributes(oSettings, row);

				/* Process each column */
				for (i = 0, iLen = oSettings.aoColumns.length; i < iLen; i++) {
					oCol = oSettings.aoColumns[i];
					create = nTrIn ? false : true;

					nTd = create ? document.createElement(oCol.sCellType) : anTds[i];

					if (!nTd) {
						_fnLog(oSettings, 0, 'Incorrect column count', 18);
					}

					nTd._DT_CellIndex = {
						row: iRow,
						column: i
					};

					cells.push(nTd);

					// Need to create the HTML if new, or if a rendering function is defined
					if (create || ((oCol.mRender || oCol.mData !== i) &&
						(!$.isPlainObject(oCol.mData) || oCol.mData._ !== i + '.display')
					)) {
						nTd.innerHTML = _fnGetCellData(oSettings, iRow, i, 'display');
					}

					/* Add user defined class */
					if (oCol.sClass) {
						nTd.className += ' ' + oCol.sClass;
					}

					// Visibility - add or remove as required
					if (oCol.bVisible && !nTrIn) {
						nTr.appendChild(nTd);
					}
					else if (!oCol.bVisible && nTrIn) {
						nTd.parentNode.removeChild(nTd);
					}

					if (oCol.fnCreatedCell) {
						oCol.fnCreatedCell.call(oSettings.oInstance,
							nTd, _fnGetCellData(oSettings, iRow, i), rowData, iRow, i
						);
					}
				}

				_fnCallbackFire(oSettings, 'aoRowCreatedCallback', null, [nTr, rowData, iRow, cells]);
			}
		}


		/**
		 * Add attributes to a row based on the special `DT_*` parameters in a data
		 * source object.
		 *  @param {object} settings DataTables settings object
		 *  @param {object} DataTables row object for the row to be modified
		 *  @memberof DataTable#oApi
		 */
		function _fnRowAttributes(settings, row) {
			var tr = row.nTr;
			var data = row._aData;

			if (tr) {
				var id = settings.rowIdFn(data);

				if (id) {
					tr.id = id;
				}

				if (data.DT_RowClass) {
					// Remove any classes added by DT_RowClass before
					var a = data.DT_RowClass.split(' ');
					row.__rowc = row.__rowc ?
						_unique(row.__rowc.concat(a)) :
						a;

					$(tr)
						.removeClass(row.__rowc.join(' '))
						.addClass(data.DT_RowClass);
				}

				if (data.DT_RowAttr) {
					$(tr).attr(data.DT_RowAttr);
				}

				if (data.DT_RowData) {
					$(tr).data(data.DT_RowData);
				}
			}
		}


		/**
		 * Create the HTML header for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnBuildHead(oSettings) {
			var i, ien, cell, row, column;
			var thead = oSettings.nTHead;
			var tfoot = oSettings.nTFoot;
			var createHeader = $('th, td', thead).length === 0;
			var classes = oSettings.oClasses;
			var columns = oSettings.aoColumns;

			if (createHeader) {
				row = $('<tr/>').appendTo(thead);
			}

			for (i = 0, ien = columns.length; i < ien; i++) {
				column = columns[i];
				cell = $(column.nTh).addClass(column.sClass);

				if (createHeader) {
					cell.appendTo(row);
				}

				// 1.11 move into sorting
				if (oSettings.oFeatures.bSort) {
					cell.addClass(column.sSortingClass);

					if (column.bSortable !== false) {
						cell
							.attr('tabindex', oSettings.iTabIndex)
							.attr('aria-controls', oSettings.sTableId);

						_fnSortAttachListener(oSettings, column.nTh, i);
					}
				}

				if (column.sTitle != cell[0].innerHTML) {
					cell.html(column.sTitle);
				}

				_fnRenderer(oSettings, 'header')(
					oSettings, cell, column, classes
				);
			}

			if (createHeader) {
				_fnDetectHeader(oSettings.aoHeader, thead);
			}

			/* Deal with the footer - add classes if required */
			$(thead).children('tr').children('th, td').addClass(classes.sHeaderTH);
			$(tfoot).children('tr').children('th, td').addClass(classes.sFooterTH);

			// Cache the footer cells. Note that we only take the cells from the first
			// row in the footer. If there is more than one row the user wants to
			// interact with, they need to use the table().foot() method. Note also this
			// allows cells to be used for multiple columns using colspan
			if (tfoot !== null) {
				var cells = oSettings.aoFooter[0];

				for (i = 0, ien = cells.length; i < ien; i++) {
					column = columns[i];

					if (column) {
						column.nTf = cells[i].cell;

						if (column.sClass) {
							$(column.nTf).addClass(column.sClass);
						}
					}
					else {
						_fnLog(oSettings, 0, 'Incorrect column count', 18);
					}
				}
			}
		}


		/**
		 * Draw the header (or footer) element based on the column visibility states. The
		 * methodology here is to use the layout array from _fnDetectHeader, modified for
		 * the instantaneous column visibility, to construct the new layout. The grid is
		 * traversed over cell at a time in a rows x columns grid fashion, although each
		 * cell insert can cover multiple elements in the grid - which is tracks using the
		 * aApplied array. Cell inserts in the grid will only occur where there isn't
		 * already a cell in that position.
		 *  @param {object} oSettings dataTables settings object
		 *  @param array {objects} aoSource Layout array from _fnDetectHeader
		 *  @param {boolean} [bIncludeHidden=false] If true then include the hidden columns in the calc,
		 *  @memberof DataTable#oApi
		 */
		function _fnDrawHead(oSettings, aoSource, bIncludeHidden) {
			var i, iLen, j, jLen, k, kLen, n, nLocalTr;
			var aoLocal = [];
			var aApplied = [];
			var iColumns = oSettings.aoColumns.length;
			var iRowspan, iColspan;

			if (!aoSource) {
				return;
			}

			if (bIncludeHidden === undefined) {
				bIncludeHidden = false;
			}

			/* Make a copy of the master layout array, but without the visible columns in it */
			for (i = 0, iLen = aoSource.length; i < iLen; i++) {
				aoLocal[i] = aoSource[i].slice();
				aoLocal[i].nTr = aoSource[i].nTr;

				/* Remove any columns which are currently hidden */
				for (j = iColumns - 1; j >= 0; j--) {
					if (!oSettings.aoColumns[j].bVisible && !bIncludeHidden) {
						aoLocal[i].splice(j, 1);
					}
				}

				/* Prep the applied array - it needs an element for each row */
				aApplied.push([]);
			}

			for (i = 0, iLen = aoLocal.length; i < iLen; i++) {
				nLocalTr = aoLocal[i].nTr;

				/* All cells are going to be replaced, so empty out the row */
				if (nLocalTr) {
					while ((n = nLocalTr.firstChild)) {
						nLocalTr.removeChild(n);
					}
				}

				for (j = 0, jLen = aoLocal[i].length; j < jLen; j++) {
					iRowspan = 1;
					iColspan = 1;

					/* Check to see if there is already a cell (row/colspan) covering our target
					 * insert point. If there is, then there is nothing to do.
					 */
					if (aApplied[i][j] === undefined) {
						nLocalTr.appendChild(aoLocal[i][j].cell);
						aApplied[i][j] = 1;

						/* Expand the cell to cover as many rows as needed */
						while (aoLocal[i + iRowspan] !== undefined &&
							aoLocal[i][j].cell == aoLocal[i + iRowspan][j].cell) {
							aApplied[i + iRowspan][j] = 1;
							iRowspan++;
						}

						/* Expand the cell to cover as many columns as needed */
						while (aoLocal[i][j + iColspan] !== undefined &&
							aoLocal[i][j].cell == aoLocal[i][j + iColspan].cell) {
							/* Must update the applied array over the rows for the columns */
							for (k = 0; k < iRowspan; k++) {
								aApplied[i + k][j + iColspan] = 1;
							}
							iColspan++;
						}

						/* Do the actual expansion in the DOM */
						$(aoLocal[i][j].cell)
							.attr('rowspan', iRowspan)
							.attr('colspan', iColspan);
					}
				}
			}
		}


		/**
		 * Insert the required TR nodes into the table for display
		 *  @param {object} oSettings dataTables settings object
		 *  @param ajaxComplete true after ajax call to complete rendering
		 *  @memberof DataTable#oApi
		 */
		function _fnDraw(oSettings, ajaxComplete) {
			// Allow for state saving and a custom start position
			_fnStart(oSettings);

			/* Provide a pre-callback function which can be used to cancel the draw is false is returned */
			var aPreDraw = _fnCallbackFire(oSettings, 'aoPreDrawCallback', 'preDraw', [oSettings]);
			if ($.inArray(false, aPreDraw) !== -1) {
				_fnProcessingDisplay(oSettings, false);
				return;
			}

			var anRows = [];
			var iRowCount = 0;
			var asStripeClasses = oSettings.asStripeClasses;
			var iStripes = asStripeClasses.length;
			var oLang = oSettings.oLanguage;
			var bServerSide = _fnDataSource(oSettings) == 'ssp';
			var aiDisplay = oSettings.aiDisplay;
			var iDisplayStart = oSettings._iDisplayStart;
			var iDisplayEnd = oSettings.fnDisplayEnd();

			oSettings.bDrawing = true;

			/* Server-side processing draw intercept */
			if (oSettings.bDeferLoading) {
				oSettings.bDeferLoading = false;
				oSettings.iDraw++;
				_fnProcessingDisplay(oSettings, false);
			}
			else if (!bServerSide) {
				oSettings.iDraw++;
			}
			else if (!oSettings.bDestroying && !ajaxComplete) {
				_fnAjaxUpdate(oSettings);
				return;
			}

			if (aiDisplay.length !== 0) {
				var iStart = bServerSide ? 0 : iDisplayStart;
				var iEnd = bServerSide ? oSettings.aoData.length : iDisplayEnd;

				for (var j = iStart; j < iEnd; j++) {
					var iDataIndex = aiDisplay[j];
					var aoData = oSettings.aoData[iDataIndex];
					if (aoData.nTr === null) {
						_fnCreateTr(oSettings, iDataIndex);
					}

					var nRow = aoData.nTr;

					/* Remove the old striping classes and then add the new one */
					if (iStripes !== 0) {
						var sStripe = asStripeClasses[iRowCount % iStripes];
						if (aoData._sRowStripe != sStripe) {
							$(nRow).removeClass(aoData._sRowStripe).addClass(sStripe);
							aoData._sRowStripe = sStripe;
						}
					}

					// Row callback functions - might want to manipulate the row
					// iRowCount and j are not currently documented. Are they at all
					// useful?
					_fnCallbackFire(oSettings, 'aoRowCallback', null,
						[nRow, aoData._aData, iRowCount, j, iDataIndex]);

					anRows.push(nRow);
					iRowCount++;
				}
			}
			else {
				/* Table is empty - create a row with an empty message in it */
				var sZero = oLang.sZeroRecords;
				if (oSettings.iDraw == 1 && _fnDataSource(oSettings) == 'ajax') {
					sZero = oLang.sLoadingRecords;
				}
				else if (oLang.sEmptyTable && oSettings.fnRecordsTotal() === 0) {
					sZero = oLang.sEmptyTable;
				}

				anRows[0] = $('<tr/>', { 'class': iStripes ? asStripeClasses[0] : '' })
					.append($('<td />', {
						'valign': 'top',
						'colSpan': _fnVisbleColumns(oSettings),
						'class': oSettings.oClasses.sRowEmpty
					}).html(sZero))[0];
			}

			/* Header and footer callbacks */
			_fnCallbackFire(oSettings, 'aoHeaderCallback', 'header', [$(oSettings.nTHead).children('tr')[0],
			_fnGetDataMaster(oSettings), iDisplayStart, iDisplayEnd, aiDisplay]);

			_fnCallbackFire(oSettings, 'aoFooterCallback', 'footer', [$(oSettings.nTFoot).children('tr')[0],
			_fnGetDataMaster(oSettings), iDisplayStart, iDisplayEnd, aiDisplay]);

			var body = $(oSettings.nTBody);

			body.children().detach();
			body.append($(anRows));

			/* Call all required callback functions for the end of a draw */
			_fnCallbackFire(oSettings, 'aoDrawCallback', 'draw', [oSettings]);

			/* Draw is complete, sorting and filtering must be as well */
			oSettings.bSorted = false;
			oSettings.bFiltered = false;
			oSettings.bDrawing = false;
		}


		/**
		 * Redraw the table - taking account of the various features which are enabled
		 *  @param {object} oSettings dataTables settings object
		 *  @param {boolean} [holdPosition] Keep the current paging position. By default
		 *    the paging is reset to the first page
		 *  @memberof DataTable#oApi
		 */
		function _fnReDraw(settings, holdPosition) {
			var
				features = settings.oFeatures,
				sort = features.bSort,
				filter = features.bFilter;

			if (sort) {
				_fnSort(settings);
			}

			if (filter) {
				_fnFilterComplete(settings, settings.oPreviousSearch);
			}
			else {
				// No filtering, so we want to just use the display master
				settings.aiDisplay = settings.aiDisplayMaster.slice();
			}

			if (holdPosition !== true) {
				settings._iDisplayStart = 0;
			}

			// Let any modules know about the draw hold position state (used by
			// scrolling internally)
			settings._drawHold = holdPosition;

			_fnDraw(settings);

			settings._drawHold = false;
		}


		/**
		 * Add the options to the page HTML for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnAddOptionsHtml(oSettings) {
			var classes = oSettings.oClasses;
			var table = $(oSettings.nTable);
			var holding = $('<div/>').insertBefore(table); // Holding element for speed
			var features = oSettings.oFeatures;

			// All DataTables are wrapped in a div
			var insert = $('<div/>', {
				id: oSettings.sTableId + '_wrapper',
				'class': classes.sWrapper + (oSettings.nTFoot ? '' : ' ' + classes.sNoFooter)
			});

			oSettings.nHolding = holding[0];
			oSettings.nTableWrapper = insert[0];
			oSettings.nTableReinsertBefore = oSettings.nTable.nextSibling;

			/* Loop over the user set positioning and place the elements as needed */
			var aDom = oSettings.sDom.split('');
			var featureNode, cOption, nNewNode, cNext, sAttr, j;
			for (var i = 0; i < aDom.length; i++) {
				featureNode = null;
				cOption = aDom[i];

				if (cOption == '<') {
					/* New container div */
					nNewNode = $('<div/>')[0];

					/* Check to see if we should append an id and/or a class name to the container */
					cNext = aDom[i + 1];
					if (cNext == "'" || cNext == '"') {
						sAttr = "";
						j = 2;
						while (aDom[i + j] != cNext) {
							sAttr += aDom[i + j];
							j++;
						}

						/* Replace jQuery UI constants @todo depreciated */
						if (sAttr == "H") {
							sAttr = classes.sJUIHeader;
						}
						else if (sAttr == "F") {
							sAttr = classes.sJUIFooter;
						}

						/* The attribute can be in the format of "#id.class", "#id" or "class" This logic
						 * breaks the string into parts and applies them as needed
						 */
						if (sAttr.indexOf('.') != -1) {
							var aSplit = sAttr.split('.');
							nNewNode.id = aSplit[0].substr(1, aSplit[0].length - 1);
							nNewNode.className = aSplit[1];
						}
						else if (sAttr.charAt(0) == "#") {
							nNewNode.id = sAttr.substr(1, sAttr.length - 1);
						}
						else {
							nNewNode.className = sAttr;
						}

						i += j; /* Move along the position array */
					}

					insert.append(nNewNode);
					insert = $(nNewNode);
				}
				else if (cOption == '>') {
					/* End container div */
					insert = insert.parent();
				}
				// @todo Move options into their own plugins?
				else if (cOption == 'l' && features.bPaginate && features.bLengthChange) {
					/* Length */
					featureNode = _fnFeatureHtmlLength(oSettings);
				}
				else if (cOption == 'f' && features.bFilter) {
					/* Filter */
					featureNode = _fnFeatureHtmlFilter(oSettings);
				}
				else if (cOption == 'r' && features.bProcessing) {
					/* pRocessing */
					featureNode = _fnFeatureHtmlProcessing(oSettings);
				}
				else if (cOption == 't') {
					/* Table */
					featureNode = _fnFeatureHtmlTable(oSettings);
				}
				else if (cOption == 'i' && features.bInfo) {
					/* Info */
					featureNode = _fnFeatureHtmlInfo(oSettings);
				}
				else if (cOption == 'p' && features.bPaginate) {
					/* Pagination */
					featureNode = _fnFeatureHtmlPaginate(oSettings);
				}
				else if (DataTable.ext.feature.length !== 0) {
					/* Plug-in features */
					var aoFeatures = DataTable.ext.feature;
					for (var k = 0, kLen = aoFeatures.length; k < kLen; k++) {
						if (cOption == aoFeatures[k].cFeature) {
							featureNode = aoFeatures[k].fnInit(oSettings);
							break;
						}
					}
				}

				/* Add to the 2D features array */
				if (featureNode) {
					var aanFeatures = oSettings.aanFeatures;

					if (!aanFeatures[cOption]) {
						aanFeatures[cOption] = [];
					}

					aanFeatures[cOption].push(featureNode);
					insert.append(featureNode);
				}
			}

			/* Built our DOM structure - replace the holding div with what we want */
			holding.replaceWith(insert);
			oSettings.nHolding = null;
		}


		/**
		 * Use the DOM source to create up an array of header cells. The idea here is to
		 * create a layout grid (array) of rows x columns, which contains a reference
		 * to the cell that that point in the grid (regardless of col/rowspan), such that
		 * any column / row could be removed and the new grid constructed
		 *  @param array {object} aLayout Array to store the calculated layout in
		 *  @param {node} nThead The header/footer element for the table
		 *  @memberof DataTable#oApi
		 */
		function _fnDetectHeader(aLayout, nThead) {
			var nTrs = $(nThead).children('tr');
			var nTr, nCell;
			var i, k, l, iLen, jLen, iColShifted, iColumn, iColspan, iRowspan;
			var bUnique;
			var fnShiftCol = function (a, i, j) {
				var k = a[i];
				while (k[j]) {
					j++;
				}
				return j;
			};

			aLayout.splice(0, aLayout.length);

			/* We know how many rows there are in the layout - so prep it */
			for (i = 0, iLen = nTrs.length; i < iLen; i++) {
				aLayout.push([]);
			}

			/* Calculate a layout array */
			for (i = 0, iLen = nTrs.length; i < iLen; i++) {
				nTr = nTrs[i];
				iColumn = 0;

				/* For every cell in the row... */
				nCell = nTr.firstChild;
				while (nCell) {
					if (nCell.nodeName.toUpperCase() == "TD" ||
						nCell.nodeName.toUpperCase() == "TH") {
						/* Get the col and rowspan attributes from the DOM and sanitise them */
						iColspan = nCell.getAttribute('colspan') * 1;
						iRowspan = nCell.getAttribute('rowspan') * 1;
						iColspan = (!iColspan || iColspan === 0 || iColspan === 1) ? 1 : iColspan;
						iRowspan = (!iRowspan || iRowspan === 0 || iRowspan === 1) ? 1 : iRowspan;

						/* There might be colspan cells already in this row, so shift our target
						 * accordingly
						 */
						iColShifted = fnShiftCol(aLayout, i, iColumn);

						/* Cache calculation for unique columns */
						bUnique = iColspan === 1 ? true : false;

						/* If there is col / rowspan, copy the information into the layout grid */
						for (l = 0; l < iColspan; l++) {
							for (k = 0; k < iRowspan; k++) {
								aLayout[i + k][iColShifted + l] = {
									"cell": nCell,
									"unique": bUnique
								};
								aLayout[i + k].nTr = nTr;
							}
						}
					}
					nCell = nCell.nextSibling;
				}
			}
		}


		/**
		 * Get an array of unique th elements, one for each column
		 *  @param {object} oSettings dataTables settings object
		 *  @param {node} nHeader automatically detect the layout from this node - optional
		 *  @param {array} aLayout thead/tfoot layout from _fnDetectHeader - optional
		 *  @returns array {node} aReturn list of unique th's
		 *  @memberof DataTable#oApi
		 */
		function _fnGetUniqueThs(oSettings, nHeader, aLayout) {
			var aReturn = [];
			if (!aLayout) {
				aLayout = oSettings.aoHeader;
				if (nHeader) {
					aLayout = [];
					_fnDetectHeader(aLayout, nHeader);
				}
			}

			for (var i = 0, iLen = aLayout.length; i < iLen; i++) {
				for (var j = 0, jLen = aLayout[i].length; j < jLen; j++) {
					if (aLayout[i][j].unique &&
						(!aReturn[j] || !oSettings.bSortCellsTop)) {
						aReturn[j] = aLayout[i][j].cell;
					}
				}
			}

			return aReturn;
		}

		/**
		 * Set the start position for draw
		 *  @param {object} oSettings dataTables settings object
		 */
		function _fnStart(oSettings) {
			var bServerSide = _fnDataSource(oSettings) == 'ssp';
			var iInitDisplayStart = oSettings.iInitDisplayStart;

			// Check and see if we have an initial draw position from state saving
			if (iInitDisplayStart !== undefined && iInitDisplayStart !== -1) {
				oSettings._iDisplayStart = bServerSide ?
					iInitDisplayStart :
					iInitDisplayStart >= oSettings.fnRecordsDisplay() ?
						0 :
						iInitDisplayStart;

				oSettings.iInitDisplayStart = -1;
			}
		}

		/**
		 * Create an Ajax call based on the table's settings, taking into account that
		 * parameters can have multiple forms, and backwards compatibility.
		 *
		 * @param {object} oSettings dataTables settings object
		 * @param {array} data Data to send to the server, required by
		 *     DataTables - may be augmented by developer callbacks
		 * @param {function} fn Callback function to run when data is obtained
		 */
		function _fnBuildAjax(oSettings, data, fn) {
			// Compatibility with 1.9-, allow fnServerData and event to manipulate
			_fnCallbackFire(oSettings, 'aoServerParams', 'serverParams', [data]);

			// Convert to object based for 1.10+ if using the old array scheme which can
			// come from server-side processing or serverParams
			if (data && Array.isArray(data)) {
				var tmp = {};
				var rbracket = /(.*?)\[\]$/;

				$.each(data, function (key, val) {
					var match = val.name.match(rbracket);

					if (match) {
						// Support for arrays
						var name = match[0];

						if (!tmp[name]) {
							tmp[name] = [];
						}
						tmp[name].push(val.value);
					}
					else {
						tmp[val.name] = val.value;
					}
				});
				data = tmp;
			}

			var ajaxData;
			var ajax = oSettings.ajax;
			var instance = oSettings.oInstance;
			var callback = function (json) {
				var status = oSettings.jqXHR
					? oSettings.jqXHR.status
					: null;

				if (json === null || (typeof status === 'number' && status == 204)) {
					json = {};
					_fnAjaxDataSrc(oSettings, json, []);
				}

				var error = json.error || json.sError;
				if (error) {
					_fnLog(oSettings, 0, error);
				}

				oSettings.json = json;

				_fnCallbackFire(oSettings, null, 'xhr', [oSettings, json, oSettings.jqXHR]);
				fn(json);
			};

			if ($.isPlainObject(ajax) && ajax.data) {
				ajaxData = ajax.data;

				var newData = typeof ajaxData === 'function' ?
					ajaxData(data, oSettings) :  // fn can manipulate data or return
					ajaxData;                      // an object object or array to merge

				// If the function returned something, use that alone
				data = typeof ajaxData === 'function' && newData ?
					newData :
					$.extend(true, data, newData);

				// Remove the data property as we've resolved it already and don't want
				// jQuery to do it again (it is restored at the end of the function)
				delete ajax.data;
			}

			var baseAjax = {
				"data": data,
				"success": callback,
				"dataType": "json",
				"cache": false,
				"type": oSettings.sServerMethod,
				"error": function (xhr, error, thrown) {
					var ret = _fnCallbackFire(oSettings, null, 'xhr', [oSettings, null, oSettings.jqXHR]);

					if ($.inArray(true, ret) === -1) {
						if (error == "parsererror") {
							_fnLog(oSettings, 0, 'Invalid JSON response', 1);
						}
						else if (xhr.readyState === 4) {
							_fnLog(oSettings, 0, 'Ajax error', 7);
						}
					}

					_fnProcessingDisplay(oSettings, false);
				}
			};

			// Store the data submitted for the API
			oSettings.oAjaxData = data;

			// Allow plug-ins and external processes to modify the data
			_fnCallbackFire(oSettings, null, 'preXhr', [oSettings, data]);

			if (oSettings.fnServerData) {
				// DataTables 1.9- compatibility
				oSettings.fnServerData.call(instance,
					oSettings.sAjaxSource,
					$.map(data, function (val, key) { // Need to convert back to 1.9 trad format
						return { name: key, value: val };
					}),
					callback,
					oSettings
				);
			}
			else if (oSettings.sAjaxSource || typeof ajax === 'string') {
				// DataTables 1.9- compatibility
				oSettings.jqXHR = $.ajax($.extend(baseAjax, {
					url: ajax || oSettings.sAjaxSource
				}));
			}
			else if (typeof ajax === 'function') {
				// Is a function - let the caller define what needs to be done
				oSettings.jqXHR = ajax.call(instance, data, callback, oSettings);
			}
			else {
				// Object to extend the base settings
				oSettings.jqXHR = $.ajax($.extend(baseAjax, ajax));

				// Restore for next time around
				ajax.data = ajaxData;
			}
		}


		/**
		 * Update the table using an Ajax call
		 *  @param {object} settings dataTables settings object
		 *  @returns {boolean} Block the table drawing or not
		 *  @memberof DataTable#oApi
		 */
		function _fnAjaxUpdate(settings) {
			settings.iDraw++;
			_fnProcessingDisplay(settings, true);

			_fnBuildAjax(
				settings,
				_fnAjaxParameters(settings),
				function (json) {
					_fnAjaxUpdateDraw(settings, json);
				}
			);
		}


		/**
		 * Build up the parameters in an object needed for a server-side processing
		 * request. Note that this is basically done twice, is different ways - a modern
		 * method which is used by default in DataTables 1.10 which uses objects and
		 * arrays, or the 1.9- method with is name / value pairs. 1.9 method is used if
		 * the sAjaxSource option is used in the initialisation, or the legacyAjax
		 * option is set.
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {bool} block the table drawing or not
		 *  @memberof DataTable#oApi
		 */
		function _fnAjaxParameters(settings) {
			var
				columns = settings.aoColumns,
				columnCount = columns.length,
				features = settings.oFeatures,
				preSearch = settings.oPreviousSearch,
				preColSearch = settings.aoPreSearchCols,
				i, data = [], dataProp, column, columnSearch,
				sort = _fnSortFlatten(settings),
				displayStart = settings._iDisplayStart,
				displayLength = features.bPaginate !== false ?
					settings._iDisplayLength :
					-1;

			var param = function (name, value) {
				data.push({ 'name': name, 'value': value });
			};

			// DataTables 1.9- compatible method
			param('sEcho', settings.iDraw);
			param('iColumns', columnCount);
			param('sColumns', _pluck(columns, 'sName').join(','));
			param('iDisplayStart', displayStart);
			param('iDisplayLength', displayLength);

			// DataTables 1.10+ method
			var d = {
				draw: settings.iDraw,
				columns: [],
				order: [],
				start: displayStart,
				length: displayLength,
				search: {
					value: preSearch.sSearch,
					regex: preSearch.bRegex
				}
			};

			for (i = 0; i < columnCount; i++) {
				column = columns[i];
				columnSearch = preColSearch[i];
				dataProp = typeof column.mData == "function" ? 'function' : column.mData;

				d.columns.push({
					data: dataProp,
					name: column.sName,
					searchable: column.bSearchable,
					orderable: column.bSortable,
					search: {
						value: columnSearch.sSearch,
						regex: columnSearch.bRegex
					}
				});

				param("mDataProp_" + i, dataProp);

				if (features.bFilter) {
					param('sSearch_' + i, columnSearch.sSearch);
					param('bRegex_' + i, columnSearch.bRegex);
					param('bSearchable_' + i, column.bSearchable);
				}

				if (features.bSort) {
					param('bSortable_' + i, column.bSortable);
				}
			}

			if (features.bFilter) {
				param('sSearch', preSearch.sSearch);
				param('bRegex', preSearch.bRegex);
			}

			if (features.bSort) {
				$.each(sort, function (i, val) {
					d.order.push({ column: val.col, dir: val.dir });

					param('iSortCol_' + i, val.col);
					param('sSortDir_' + i, val.dir);
				});

				param('iSortingCols', sort.length);
			}

			// If the legacy.ajax parameter is null, then we automatically decide which
			// form to use, based on sAjaxSource
			var legacy = DataTable.ext.legacy.ajax;
			if (legacy === null) {
				return settings.sAjaxSource ? data : d;
			}

			// Otherwise, if legacy has been specified then we use that to decide on the
			// form
			return legacy ? data : d;
		}


		/**
		 * Data the data from the server (nuking the old) and redraw the table
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} json json data return from the server.
		 *  @param {string} json.sEcho Tracking flag for DataTables to match requests
		 *  @param {int} json.iTotalRecords Number of records in the data set, not accounting for filtering
		 *  @param {int} json.iTotalDisplayRecords Number of records in the data set, accounting for filtering
		 *  @param {array} json.aaData The data to display on this page
		 *  @param {string} [json.sColumns] Column ordering (sName, comma separated)
		 *  @memberof DataTable#oApi
		 */
		function _fnAjaxUpdateDraw(settings, json) {
			// v1.10 uses camelCase variables, while 1.9 uses Hungarian notation.
			// Support both
			var compat = function (old, modern) {
				return json[old] !== undefined ? json[old] : json[modern];
			};

			var data = _fnAjaxDataSrc(settings, json);
			var draw = compat('sEcho', 'draw');
			var recordsTotal = compat('iTotalRecords', 'recordsTotal');
			var recordsFiltered = compat('iTotalDisplayRecords', 'recordsFiltered');

			if (draw !== undefined) {
				// Protect against out of sequence returns
				if (draw * 1 < settings.iDraw) {
					return;
				}
				settings.iDraw = draw * 1;
			}

			// No data in returned object, so rather than an array, we show an empty table
			if (!data) {
				data = [];
			}

			_fnClearTable(settings);
			settings._iRecordsTotal = parseInt(recordsTotal, 10);
			settings._iRecordsDisplay = parseInt(recordsFiltered, 10);

			for (var i = 0, ien = data.length; i < ien; i++) {
				_fnAddData(settings, data[i]);
			}
			settings.aiDisplay = settings.aiDisplayMaster.slice();

			_fnDraw(settings, true);

			if (!settings._bInitComplete) {
				_fnInitComplete(settings, json);
			}

			_fnProcessingDisplay(settings, false);
		}


		/**
		 * Get the data from the JSON data source to use for drawing a table. Using
		 * `_fnGetObjectDataFn` allows the data to be sourced from a property of the
		 * source object, or from a processing function.
		 *  @param {object} oSettings dataTables settings object
		 *  @param  {object} json Data source object / array from the server
		 *  @return {array} Array of data to use
		 */
		function _fnAjaxDataSrc(oSettings, json, write) {
			var dataSrc = $.isPlainObject(oSettings.ajax) && oSettings.ajax.dataSrc !== undefined ?
				oSettings.ajax.dataSrc :
				oSettings.sAjaxDataProp; // Compatibility with 1.9-.

			if (!write) {
				if (dataSrc === 'data') {
					// If the default, then we still want to support the old style, and safely ignore
					// it if possible
					return json.aaData || json[dataSrc];
				}

				return dataSrc !== "" ?
					_fnGetObjectDataFn(dataSrc)(json) :
					json;
			}

			// set
			_fnSetObjectDataFn(dataSrc)(json, write);
		}

		/**
		 * Generate the node required for filtering text
		 *  @returns {node} Filter control element
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlFilter(settings) {
			var classes = settings.oClasses;
			var tableId = settings.sTableId;
			var language = settings.oLanguage;
			var previousSearch = settings.oPreviousSearch;
			var features = settings.aanFeatures;
			var input = '<input type="search" class="' + classes.sFilterInput + '"/>';

			var str = language.sSearch;
			str = str.match(/_INPUT_/) ?
				str.replace('_INPUT_', input) :
				str + input;

			var filter = $('<div/>', {
				'id': !features.f ? tableId + '_filter' : null,
				'class': classes.sFilter
			})
				.append($('<label/>').append(str));

			var searchFn = function (event) {
				/* Update all other filter input elements for the new display */
				var n = features.f;
				var val = !this.value ? "" : this.value; // mental IE8 fix :-(
				if (previousSearch.return && event.key !== "Enter") {
					return;
				}
				/* Now do the filter */
				if (val != previousSearch.sSearch) {
					_fnFilterComplete(settings, {
						"sSearch": val,
						"bRegex": previousSearch.bRegex,
						"bSmart": previousSearch.bSmart,
						"bCaseInsensitive": previousSearch.bCaseInsensitive,
						"return": previousSearch.return
					});

					// Need to redraw, without resorting
					settings._iDisplayStart = 0;
					_fnDraw(settings);
				}
			};

			var searchDelay = settings.searchDelay !== null ?
				settings.searchDelay :
				_fnDataSource(settings) === 'ssp' ?
					400 :
					0;

			var jqFilter = $('input', filter)
				.val(previousSearch.sSearch)
				.attr('placeholder', language.sSearchPlaceholder)
				.on(
					'keyup.DT search.DT input.DT paste.DT cut.DT',
					searchDelay ?
						_fnThrottle(searchFn, searchDelay) :
						searchFn
				)
				.on('mouseup', function (e) {
					// Edge fix! Edge 17 does not trigger anything other than mouse events when clicking
					// on the clear icon (Edge bug 17584515). This is safe in other browsers as `searchFn`
					// checks the value to see if it has changed. In other browsers it won't have.
					setTimeout(function () {
						searchFn.call(jqFilter[0], e);
					}, 10);
				})
				.on('keypress.DT', function (e) {
					/* Prevent form submission */
					if (e.keyCode == 13) {
						return false;
					}
				})
				.attr('aria-controls', tableId);

			// Update the input elements whenever the table is filtered
			$(settings.nTable).on('search.dt.DT', function (ev, s) {
				if (settings === s) {
					// IE9 throws an 'unknown error' if document.activeElement is used
					// inside an iframe or frame...
					try {
						if (jqFilter[0] !== document.activeElement) {
							jqFilter.val(previousSearch.sSearch);
						}
					}
					catch (e) { }
				}
			});

			return filter[0];
		}


		/**
		 * Filter the table using both the global filter and column based filtering
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} oSearch search information
		 *  @param {int} [iForce] force a research of the master array (1) or not (undefined or 0)
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterComplete(oSettings, oInput, iForce) {
			var oPrevSearch = oSettings.oPreviousSearch;
			var aoPrevSearch = oSettings.aoPreSearchCols;
			var fnSaveFilter = function (oFilter) {
				/* Save the filtering values */
				oPrevSearch.sSearch = oFilter.sSearch;
				oPrevSearch.bRegex = oFilter.bRegex;
				oPrevSearch.bSmart = oFilter.bSmart;
				oPrevSearch.bCaseInsensitive = oFilter.bCaseInsensitive;
				oPrevSearch.return = oFilter.return;
			};
			var fnRegex = function (o) {
				// Backwards compatibility with the bEscapeRegex option
				return o.bEscapeRegex !== undefined ? !o.bEscapeRegex : o.bRegex;
			};

			// Resolve any column types that are unknown due to addition or invalidation
			// @todo As per sort - can this be moved into an event handler?
			_fnColumnTypes(oSettings);

			/* In server-side processing all filtering is done by the server, so no point hanging around here */
			if (_fnDataSource(oSettings) != 'ssp') {
				/* Global filter */
				_fnFilter(oSettings, oInput.sSearch, iForce, fnRegex(oInput), oInput.bSmart, oInput.bCaseInsensitive, oInput.return);
				fnSaveFilter(oInput);

				/* Now do the individual column filter */
				for (var i = 0; i < aoPrevSearch.length; i++) {
					_fnFilterColumn(oSettings, aoPrevSearch[i].sSearch, i, fnRegex(aoPrevSearch[i]),
						aoPrevSearch[i].bSmart, aoPrevSearch[i].bCaseInsensitive);
				}

				/* Custom filtering */
				_fnFilterCustom(oSettings);
			}
			else {
				fnSaveFilter(oInput);
			}

			/* Tell the draw function we have been filtering */
			oSettings.bFiltered = true;
			_fnCallbackFire(oSettings, null, 'search', [oSettings]);
		}


		/**
		 * Apply custom filtering functions
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterCustom(settings) {
			var filters = DataTable.ext.search;
			var displayRows = settings.aiDisplay;
			var row, rowIdx;

			for (var i = 0, ien = filters.length; i < ien; i++) {
				var rows = [];

				// Loop over each row and see if it should be included
				for (var j = 0, jen = displayRows.length; j < jen; j++) {
					rowIdx = displayRows[j];
					row = settings.aoData[rowIdx];

					if (filters[i](settings, row._aFilterData, rowIdx, row._aData, j)) {
						rows.push(rowIdx);
					}
				}

				// So the array reference doesn't break set the results into the
				// existing array
				displayRows.length = 0;
				$.merge(displayRows, rows);
			}
		}


		/**
		 * Filter the table on a per-column basis
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sInput string to filter on
		 *  @param {int} iColumn column to filter
		 *  @param {bool} bRegex treat search string as a regular expression or not
		 *  @param {bool} bSmart use smart filtering or not
		 *  @param {bool} bCaseInsensitive Do case insensitive matching or not
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterColumn(settings, searchStr, colIdx, regex, smart, caseInsensitive) {
			if (searchStr === '') {
				return;
			}

			var data;
			var out = [];
			var display = settings.aiDisplay;
			var rpSearch = _fnFilterCreateSearch(searchStr, regex, smart, caseInsensitive);

			for (var i = 0; i < display.length; i++) {
				data = settings.aoData[display[i]]._aFilterData[colIdx];

				if (rpSearch.test(data)) {
					out.push(display[i]);
				}
			}

			settings.aiDisplay = out;
		}


		/**
		 * Filter the data table based on user input and draw the table
		 *  @param {object} settings dataTables settings object
		 *  @param {string} input string to filter on
		 *  @param {int} force optional - force a research of the master array (1) or not (undefined or 0)
		 *  @param {bool} regex treat as a regular expression or not
		 *  @param {bool} smart perform smart filtering or not
		 *  @param {bool} caseInsensitive Do case insensitive matching or not
		 *  @memberof DataTable#oApi
		 */
		function _fnFilter(settings, input, force, regex, smart, caseInsensitive) {
			var rpSearch = _fnFilterCreateSearch(input, regex, smart, caseInsensitive);
			var prevSearch = settings.oPreviousSearch.sSearch;
			var displayMaster = settings.aiDisplayMaster;
			var display, invalidated, i;
			var filtered = [];

			// Need to take account of custom filtering functions - always filter
			if (DataTable.ext.search.length !== 0) {
				force = true;
			}

			// Check if any of the rows were invalidated
			invalidated = _fnFilterData(settings);

			// If the input is blank - we just want the full data set
			if (input.length <= 0) {
				settings.aiDisplay = displayMaster.slice();
			}
			else {
				// New search - start from the master array
				if (invalidated ||
					force ||
					regex ||
					prevSearch.length > input.length ||
					input.indexOf(prevSearch) !== 0 ||
					settings.bSorted // On resort, the display master needs to be
					// re-filtered since indexes will have changed
				) {
					settings.aiDisplay = displayMaster.slice();
				}

				// Search the display array
				display = settings.aiDisplay;

				for (i = 0; i < display.length; i++) {
					if (rpSearch.test(settings.aoData[display[i]]._sFilterRow)) {
						filtered.push(display[i]);
					}
				}

				settings.aiDisplay = filtered;
			}
		}


		/**
		 * Build a regular expression object suitable for searching a table
		 *  @param {string} sSearch string to search for
		 *  @param {bool} bRegex treat as a regular expression or not
		 *  @param {bool} bSmart perform smart filtering or not
		 *  @param {bool} bCaseInsensitive Do case insensitive matching or not
		 *  @returns {RegExp} constructed object
		 *  @memberof DataTable#oApi
		 */
		function _fnFilterCreateSearch(search, regex, smart, caseInsensitive) {
			search = regex ?
				search :
				_fnEscapeRegex(search);

			if (smart) {
				/* For smart filtering we want to allow the search to work regardless of
				 * word order. We also want double quoted text to be preserved, so word
				 * order is important - a la google. So this is what we want to
				 * generate:
				 * 
				 * ^(?=.*?\bone\b)(?=.*?\btwo three\b)(?=.*?\bfour\b).*$
				 */
				var a = $.map(search.match(/"[^"]+"|[^ ]+/g) || [''], function (word) {
					if (word.charAt(0) === '"') {
						var m = word.match(/^"(.*)"$/);
						word = m ? m[1] : word;
					}

					return word.replace('"', '');
				});

				search = '^(?=.*?' + a.join(')(?=.*?') + ').*$';
			}

			return new RegExp(search, caseInsensitive ? 'i' : '');
		}


		/**
		 * Escape a string such that it can be used in a regular expression
		 *  @param {string} sVal string to escape
		 *  @returns {string} escaped string
		 *  @memberof DataTable#oApi
		 */
		var _fnEscapeRegex = DataTable.util.escapeRegex;

		var __filter_div = $('<div>')[0];
		var __filter_div_textContent = __filter_div.textContent !== undefined;

		// Update the filtering data for each row if needed (by invalidation or first run)
		function _fnFilterData(settings) {
			var columns = settings.aoColumns;
			var column;
			var i, j, ien, jen, filterData, cellData, row;
			var wasInvalidated = false;

			for (i = 0, ien = settings.aoData.length; i < ien; i++) {
				row = settings.aoData[i];

				if (!row._aFilterData) {
					filterData = [];

					for (j = 0, jen = columns.length; j < jen; j++) {
						column = columns[j];

						if (column.bSearchable) {
							cellData = _fnGetCellData(settings, i, j, 'filter');

							// Search in DataTables 1.10 is string based. In 1.11 this
							// should be altered to also allow strict type checking.
							if (cellData === null) {
								cellData = '';
							}

							if (typeof cellData !== 'string' && cellData.toString) {
								cellData = cellData.toString();
							}
						}
						else {
							cellData = '';
						}

						// If it looks like there is an HTML entity in the string,
						// attempt to decode it so sorting works as expected. Note that
						// we could use a single line of jQuery to do this, but the DOM
						// method used here is much faster http://jsperf.com/html-decode
						if (cellData.indexOf && cellData.indexOf('&') !== -1) {
							__filter_div.innerHTML = cellData;
							cellData = __filter_div_textContent ?
								__filter_div.textContent :
								__filter_div.innerText;
						}

						if (cellData.replace) {
							cellData = cellData.replace(/[\r\n\u2028]/g, '');
						}

						filterData.push(cellData);
					}

					row._aFilterData = filterData;
					row._sFilterRow = filterData.join('  ');
					wasInvalidated = true;
				}
			}

			return wasInvalidated;
		}


		/**
		 * Convert from the internal Hungarian notation to camelCase for external
		 * interaction
		 *  @param {object} obj Object to convert
		 *  @returns {object} Inverted object
		 *  @memberof DataTable#oApi
		 */
		function _fnSearchToCamel(obj) {
			return {
				search: obj.sSearch,
				smart: obj.bSmart,
				regex: obj.bRegex,
				caseInsensitive: obj.bCaseInsensitive
			};
		}



		/**
		 * Convert from camelCase notation to the internal Hungarian. We could use the
		 * Hungarian convert function here, but this is cleaner
		 *  @param {object} obj Object to convert
		 *  @returns {object} Inverted object
		 *  @memberof DataTable#oApi
		 */
		function _fnSearchToHung(obj) {
			return {
				sSearch: obj.search,
				bSmart: obj.smart,
				bRegex: obj.regex,
				bCaseInsensitive: obj.caseInsensitive
			};
		}

		/**
		 * Generate the node required for the info display
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Information element
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlInfo(settings) {
			var
				tid = settings.sTableId,
				nodes = settings.aanFeatures.i,
				n = $('<div/>', {
					'class': settings.oClasses.sInfo,
					'id': !nodes ? tid + '_info' : null
				});

			if (!nodes) {
				// Update display on each draw
				settings.aoDrawCallback.push({
					"fn": _fnUpdateInfo,
					"sName": "information"
				});

				n
					.attr('role', 'status')
					.attr('aria-live', 'polite');

				// Table is described by our info div
				$(settings.nTable).attr('aria-describedby', tid + '_info');
			}

			return n[0];
		}


		/**
		 * Update the information elements in the display
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnUpdateInfo(settings) {
			/* Show information about the table */
			var nodes = settings.aanFeatures.i;
			if (nodes.length === 0) {
				return;
			}

			var
				lang = settings.oLanguage,
				start = settings._iDisplayStart + 1,
				end = settings.fnDisplayEnd(),
				max = settings.fnRecordsTotal(),
				total = settings.fnRecordsDisplay(),
				out = total ?
					lang.sInfo :
					lang.sInfoEmpty;

			if (total !== max) {
				/* Record set after filtering */
				out += ' ' + lang.sInfoFiltered;
			}

			// Convert the macros
			out += lang.sInfoPostFix;
			out = _fnInfoMacros(settings, out);

			var callback = lang.fnInfoCallback;
			if (callback !== null) {
				out = callback.call(settings.oInstance,
					settings, start, end, max, total, out
				);
			}

			$(nodes).html(out);
		}


		function _fnInfoMacros(settings, str) {
			// When infinite scrolling, we are always starting at 1. _iDisplayStart is used only
			// internally
			var
				formatter = settings.fnFormatNumber,
				start = settings._iDisplayStart + 1,
				len = settings._iDisplayLength,
				vis = settings.fnRecordsDisplay(),
				all = len === -1;

			return str.
				replace(/_START_/g, formatter.call(settings, start)).
				replace(/_END_/g, formatter.call(settings, settings.fnDisplayEnd())).
				replace(/_MAX_/g, formatter.call(settings, settings.fnRecordsTotal())).
				replace(/_TOTAL_/g, formatter.call(settings, vis)).
				replace(/_PAGE_/g, formatter.call(settings, all ? 1 : Math.ceil(start / len))).
				replace(/_PAGES_/g, formatter.call(settings, all ? 1 : Math.ceil(vis / len)));
		}



		/**
		 * Draw the table for the first time, adding all required features
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnInitialise(settings) {
			var i, iLen, iAjaxStart = settings.iInitDisplayStart;
			var columns = settings.aoColumns, column;
			var features = settings.oFeatures;
			var deferLoading = settings.bDeferLoading; // value modified by the draw

			/* Ensure that the table data is fully initialised */
			if (!settings.bInitialised) {
				setTimeout(function () { _fnInitialise(settings); }, 200);
				return;
			}

			/* Show the display HTML options */
			_fnAddOptionsHtml(settings);

			/* Build and draw the header / footer for the table */
			_fnBuildHead(settings);
			_fnDrawHead(settings, settings.aoHeader);
			_fnDrawHead(settings, settings.aoFooter);

			/* Okay to show that something is going on now */
			_fnProcessingDisplay(settings, true);

			/* Calculate sizes for columns */
			if (features.bAutoWidth) {
				_fnCalculateColumnWidths(settings);
			}

			for (i = 0, iLen = columns.length; i < iLen; i++) {
				column = columns[i];

				if (column.sWidth) {
					column.nTh.style.width = _fnStringToCss(column.sWidth);
				}
			}

			_fnCallbackFire(settings, null, 'preInit', [settings]);

			// If there is default sorting required - let's do it. The sort function
			// will do the drawing for us. Otherwise we draw the table regardless of the
			// Ajax source - this allows the table to look initialised for Ajax sourcing
			// data (show 'loading' message possibly)
			_fnReDraw(settings);

			// Server-side processing init complete is done by _fnAjaxUpdateDraw
			var dataSrc = _fnDataSource(settings);
			if (dataSrc != 'ssp' || deferLoading) {
				// if there is an ajax source load the data
				if (dataSrc == 'ajax') {
					_fnBuildAjax(settings, [], function (json) {
						var aData = _fnAjaxDataSrc(settings, json);

						// Got the data - add it to the table
						for (i = 0; i < aData.length; i++) {
							_fnAddData(settings, aData[i]);
						}

						// Reset the init display for cookie saving. We've already done
						// a filter, and therefore cleared it before. So we need to make
						// it appear 'fresh'
						settings.iInitDisplayStart = iAjaxStart;

						_fnReDraw(settings);

						_fnProcessingDisplay(settings, false);
						_fnInitComplete(settings, json);
					}, settings);
				}
				else {
					_fnProcessingDisplay(settings, false);
					_fnInitComplete(settings);
				}
			}
		}


		/**
		 * Draw the table for the first time, adding all required features
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} [json] JSON from the server that completed the table, if using Ajax source
		 *    with client-side processing (optional)
		 *  @memberof DataTable#oApi
		 */
		function _fnInitComplete(settings, json) {
			settings._bInitComplete = true;

			// When data was added after the initialisation (data or Ajax) we need to
			// calculate the column sizing
			if (json || settings.oInit.aaData) {
				_fnAdjustColumnSizing(settings);
			}

			_fnCallbackFire(settings, null, 'plugin-init', [settings, json]);
			_fnCallbackFire(settings, 'aoInitComplete', 'init', [settings, json]);
		}


		function _fnLengthChange(settings, val) {
			var len = parseInt(val, 10);
			settings._iDisplayLength = len;

			_fnLengthOverflow(settings);

			// Fire length change event
			_fnCallbackFire(settings, null, 'length', [settings, len]);
		}


		/**
		 * Generate the node required for user display length changing
		 *  @param {object} settings dataTables settings object
		 *  @returns {node} Display length feature node
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlLength(settings) {
			var
				classes = settings.oClasses,
				tableId = settings.sTableId,
				menu = settings.aLengthMenu,
				d2 = Array.isArray(menu[0]),
				lengths = d2 ? menu[0] : menu,
				language = d2 ? menu[1] : menu;

			var select = $('<select/>', {
				'name': tableId + '_length',
				'aria-controls': tableId,
				'class': classes.sLengthSelect
			});

			for (var i = 0, ien = lengths.length; i < ien; i++) {
				select[0][i] = new Option(
					typeof language[i] === 'number' ?
						settings.fnFormatNumber(language[i]) :
						language[i],
					lengths[i]
				);
			}

			var div = $('<div><label/></div>').addClass(classes.sLength);
			if (!settings.aanFeatures.l) {
				div[0].id = tableId + '_length';
			}

			div.children().append(
				settings.oLanguage.sLengthMenu.replace('_MENU_', select[0].outerHTML)
			);

			// Can't use `select` variable as user might provide their own and the
			// reference is broken by the use of outerHTML
			$('select', div)
				.val(settings._iDisplayLength)
				.on('change.DT', function (e) {
					_fnLengthChange(settings, $(this).val());
					_fnDraw(settings);
				});

			// Update node value whenever anything changes the table's length
			$(settings.nTable).on('length.dt.DT', function (e, s, len) {
				if (settings === s) {
					$('select', div).val(len);
				}
			});

			return div[0];
		}



		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Note that most of the paging logic is done in
		 * DataTable.ext.pager
		 */

		/**
		 * Generate the node required for default pagination
		 *  @param {object} oSettings dataTables settings object
		 *  @returns {node} Pagination feature node
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlPaginate(settings) {
			var
				type = settings.sPaginationType,
				plugin = DataTable.ext.pager[type],
				modern = typeof plugin === 'function',
				redraw = function (settings) {
					_fnDraw(settings);
				},
				node = $('<div/>').addClass(settings.oClasses.sPaging + type)[0],
				features = settings.aanFeatures;

			if (!modern) {
				plugin.fnInit(settings, node, redraw);
			}

			/* Add a draw callback for the pagination on first instance, to update the paging display */
			if (!features.p) {
				node.id = settings.sTableId + '_paginate';

				settings.aoDrawCallback.push({
					"fn": function (settings) {
						if (modern) {
							var
								start = settings._iDisplayStart,
								len = settings._iDisplayLength,
								visRecords = settings.fnRecordsDisplay(),
								all = len === -1,
								page = all ? 0 : Math.ceil(start / len),
								pages = all ? 1 : Math.ceil(visRecords / len),
								buttons = plugin(page, pages),
								i, ien;

							for (i = 0, ien = features.p.length; i < ien; i++) {
								_fnRenderer(settings, 'pageButton')(
									settings, features.p[i], i, buttons, page, pages
								);
							}
						}
						else {
							plugin.fnUpdate(settings, redraw);
						}
					},
					"sName": "pagination"
				});
			}

			return node;
		}


		/**
		 * Alter the display settings to change the page
		 *  @param {object} settings DataTables settings object
		 *  @param {string|int} action Paging action to take: "first", "previous",
		 *    "next" or "last" or page number to jump to (integer)
		 *  @param [bool] redraw Automatically draw the update or not
		 *  @returns {bool} true page has changed, false - no change
		 *  @memberof DataTable#oApi
		 */
		function _fnPageChange(settings, action, redraw) {
			var
				start = settings._iDisplayStart,
				len = settings._iDisplayLength,
				records = settings.fnRecordsDisplay();

			if (records === 0 || len === -1) {
				start = 0;
			}
			else if (typeof action === "number") {
				start = action * len;

				if (start > records) {
					start = 0;
				}
			}
			else if (action == "first") {
				start = 0;
			}
			else if (action == "previous") {
				start = len >= 0 ?
					start - len :
					0;

				if (start < 0) {
					start = 0;
				}
			}
			else if (action == "next") {
				if (start + len < records) {
					start += len;
				}
			}
			else if (action == "last") {
				start = Math.floor((records - 1) / len) * len;
			}
			else {
				_fnLog(settings, 0, "Unknown paging action: " + action, 5);
			}

			var changed = settings._iDisplayStart !== start;
			settings._iDisplayStart = start;

			if (changed) {
				_fnCallbackFire(settings, null, 'page', [settings]);

				if (redraw) {
					_fnDraw(settings);
				}
			}
			else {
				// No change event - paging was called, but no change
				_fnCallbackFire(settings, null, 'page-nc', [settings]);
			}

			return changed;
		}



		/**
		 * Generate the node required for the processing node
		 *  @param {object} settings dataTables settings object
		 *  @returns {node} Processing element
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlProcessing(settings) {
			return $('<div/>', {
				'id': !settings.aanFeatures.r ? settings.sTableId + '_processing' : null,
				'class': settings.oClasses.sProcessing
			})
				.html(settings.oLanguage.sProcessing)
				.append('<div><div></div><div></div><div></div><div></div></div>')
				.insertBefore(settings.nTable)[0];
		}


		/**
		 * Display or hide the processing indicator
		 *  @param {object} settings dataTables settings object
		 *  @param {bool} show Show the processing indicator (true) or not (false)
		 *  @memberof DataTable#oApi
		 */
		function _fnProcessingDisplay(settings, show) {
			if (settings.oFeatures.bProcessing) {
				$(settings.aanFeatures.r).css('display', show ? 'block' : 'none');
			}

			_fnCallbackFire(settings, null, 'processing', [settings, show]);
		}

		/**
		 * Add any control elements for the table - specifically scrolling
		 *  @param {object} settings dataTables settings object
		 *  @returns {node} Node to add to the DOM
		 *  @memberof DataTable#oApi
		 */
		function _fnFeatureHtmlTable(settings) {
			var table = $(settings.nTable);

			// Scrolling from here on in
			var scroll = settings.oScroll;

			if (scroll.sX === '' && scroll.sY === '') {
				return settings.nTable;
			}

			var scrollX = scroll.sX;
			var scrollY = scroll.sY;
			var classes = settings.oClasses;
			var caption = table.children('caption');
			var captionSide = caption.length ? caption[0]._captionSide : null;
			var headerClone = $(table[0].cloneNode(false));
			var footerClone = $(table[0].cloneNode(false));
			var footer = table.children('tfoot');
			var _div = '<div/>';
			var size = function (s) {
				return !s ? null : _fnStringToCss(s);
			};

			if (!footer.length) {
				footer = null;
			}

			/*
			 * The HTML structure that we want to generate in this function is:
			 *  div - scroller
			 *    div - scroll head
			 *      div - scroll head inner
			 *        table - scroll head table
			 *          thead - thead
			 *    div - scroll body
			 *      table - table (master table)
			 *        thead - thead clone for sizing
			 *        tbody - tbody
			 *    div - scroll foot
			 *      div - scroll foot inner
			 *        table - scroll foot table
			 *          tfoot - tfoot
			 */
			var scroller = $(_div, { 'class': classes.sScrollWrapper })
				.append(
					$(_div, { 'class': classes.sScrollHead })
						.css({
							overflow: 'hidden',
							position: 'relative',
							border: 0,
							width: scrollX ? size(scrollX) : '100%'
						})
						.append(
							$(_div, { 'class': classes.sScrollHeadInner })
								.css({
									'box-sizing': 'content-box',
									width: scroll.sXInner || '100%'
								})
								.append(
									headerClone
										.removeAttr('id')
										.css('margin-left', 0)
										.append(captionSide === 'top' ? caption : null)
										.append(
											table.children('thead')
										)
								)
						)
				)
				.append(
					$(_div, { 'class': classes.sScrollBody })
						.css({
							position: 'relative',
							overflow: 'auto',
							width: size(scrollX)
						})
						.append(table)
				);

			if (footer) {
				scroller.append(
					$(_div, { 'class': classes.sScrollFoot })
						.css({
							overflow: 'hidden',
							border: 0,
							width: scrollX ? size(scrollX) : '100%'
						})
						.append(
							$(_div, { 'class': classes.sScrollFootInner })
								.append(
									footerClone
										.removeAttr('id')
										.css('margin-left', 0)
										.append(captionSide === 'bottom' ? caption : null)
										.append(
											table.children('tfoot')
										)
								)
						)
				);
			}

			var children = scroller.children();
			var scrollHead = children[0];
			var scrollBody = children[1];
			var scrollFoot = footer ? children[2] : null;

			// When the body is scrolled, then we also want to scroll the headers
			if (scrollX) {
				$(scrollBody).on('scroll.DT', function (e) {
					var scrollLeft = this.scrollLeft;

					scrollHead.scrollLeft = scrollLeft;

					if (footer) {
						scrollFoot.scrollLeft = scrollLeft;
					}
				});
			}

			$(scrollBody).css('max-height', scrollY);
			if (!scroll.bCollapse) {
				$(scrollBody).css('height', scrollY);
			}

			settings.nScrollHead = scrollHead;
			settings.nScrollBody = scrollBody;
			settings.nScrollFoot = scrollFoot;

			// On redraw - align columns
			settings.aoDrawCallback.push({
				"fn": _fnScrollDraw,
				"sName": "scrolling"
			});

			return scroller[0];
		}



		/**
		 * Update the header, footer and body tables for resizing - i.e. column
		 * alignment.
		 *
		 * Welcome to the most horrible function DataTables. The process that this
		 * function follows is basically:
		 *   1. Re-create the table inside the scrolling div
		 *   2. Take live measurements from the DOM
		 *   3. Apply the measurements to align the columns
		 *   4. Clean up
		 *
		 *  @param {object} settings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnScrollDraw(settings) {
			// Given that this is such a monster function, a lot of variables are use
			// to try and keep the minimised size as small as possible
			var
				scroll = settings.oScroll,
				scrollX = scroll.sX,
				scrollXInner = scroll.sXInner,
				scrollY = scroll.sY,
				barWidth = scroll.iBarWidth,
				divHeader = $(settings.nScrollHead),
				divHeaderStyle = divHeader[0].style,
				divHeaderInner = divHeader.children('div'),
				divHeaderInnerStyle = divHeaderInner[0].style,
				divHeaderTable = divHeaderInner.children('table'),
				divBodyEl = settings.nScrollBody,
				divBody = $(divBodyEl),
				divBodyStyle = divBodyEl.style,
				divFooter = $(settings.nScrollFoot),
				divFooterInner = divFooter.children('div'),
				divFooterTable = divFooterInner.children('table'),
				header = $(settings.nTHead),
				table = $(settings.nTable),
				tableEl = table[0],
				tableStyle = tableEl.style,
				footer = settings.nTFoot ? $(settings.nTFoot) : null,
				browser = settings.oBrowser,
				ie67 = browser.bScrollOversize,
				dtHeaderCells = _pluck(settings.aoColumns, 'nTh'),
				headerTrgEls, footerTrgEls,
				headerSrcEls, footerSrcEls,
				headerCopy, footerCopy,
				headerWidths = [], footerWidths = [],
				headerContent = [], footerContent = [],
				idx, correction, sanityWidth,
				zeroOut = function (nSizer) {
					var style = nSizer.style;
					style.paddingTop = "0";
					style.paddingBottom = "0";
					style.borderTopWidth = "0";
					style.borderBottomWidth = "0";
					style.height = 0;
				};

			// If the scrollbar visibility has changed from the last draw, we need to
			// adjust the column sizes as the table width will have changed to account
			// for the scrollbar
			var scrollBarVis = divBodyEl.scrollHeight > divBodyEl.clientHeight;

			if (settings.scrollBarVis !== scrollBarVis && settings.scrollBarVis !== undefined) {
				settings.scrollBarVis = scrollBarVis;
				_fnAdjustColumnSizing(settings);
				return; // adjust column sizing will call this function again
			}
			else {
				settings.scrollBarVis = scrollBarVis;
			}

			/*
			 * 1. Re-create the table inside the scrolling div
			 */

			// Remove the old minimised thead and tfoot elements in the inner table
			table.children('thead, tfoot').remove();

			if (footer) {
				footerCopy = footer.clone().prependTo(table);
				footerTrgEls = footer.find('tr'); // the original tfoot is in its own table and must be sized
				footerSrcEls = footerCopy.find('tr');
				footerCopy.find('[id]').removeAttr('id');
			}

			// Clone the current header and footer elements and then place it into the inner table
			headerCopy = header.clone().prependTo(table);
			headerTrgEls = header.find('tr'); // original header is in its own table
			headerSrcEls = headerCopy.find('tr');
			headerCopy.find('th, td').removeAttr('tabindex');
			headerCopy.find('[id]').removeAttr('id');


			/*
			 * 2. Take live measurements from the DOM - do not alter the DOM itself!
			 */

			// Remove old sizing and apply the calculated column widths
			// Get the unique column headers in the newly created (cloned) header. We want to apply the
			// calculated sizes to this header
			if (!scrollX) {
				divBodyStyle.width = '100%';
				divHeader[0].style.width = '100%';
			}

			$.each(_fnGetUniqueThs(settings, headerCopy), function (i, el) {
				idx = _fnVisibleToColumnIndex(settings, i);
				el.style.width = settings.aoColumns[idx].sWidth;
			});

			if (footer) {
				_fnApplyToChildren(function (n) {
					n.style.width = "";
				}, footerSrcEls);
			}

			// Size the table as a whole
			sanityWidth = table.outerWidth();
			if (scrollX === "") {
				// No x scrolling
				tableStyle.width = "100%";

				// IE7 will make the width of the table when 100% include the scrollbar
				// - which is shouldn't. When there is a scrollbar we need to take this
				// into account.
				if (ie67 && (table.find('tbody').height() > divBodyEl.offsetHeight ||
					divBody.css('overflow-y') == "scroll")
				) {
					tableStyle.width = _fnStringToCss(table.outerWidth() - barWidth);
				}

				// Recalculate the sanity width
				sanityWidth = table.outerWidth();
			}
			else if (scrollXInner !== "") {
				// legacy x scroll inner has been given - use it
				tableStyle.width = _fnStringToCss(scrollXInner);

				// Recalculate the sanity width
				sanityWidth = table.outerWidth();
			}

			// Hidden header should have zero height, so remove padding and borders. Then
			// set the width based on the real headers

			// Apply all styles in one pass
			_fnApplyToChildren(zeroOut, headerSrcEls);

			// Read all widths in next pass
			_fnApplyToChildren(function (nSizer) {
				var style = window.getComputedStyle ?
					window.getComputedStyle(nSizer).width :
					_fnStringToCss($(nSizer).width());

				headerContent.push(nSizer.innerHTML);
				headerWidths.push(style);
			}, headerSrcEls);

			// Apply all widths in final pass
			_fnApplyToChildren(function (nToSize, i) {
				nToSize.style.width = headerWidths[i];
			}, headerTrgEls);

			$(headerSrcEls).css('height', 0);

			/* Same again with the footer if we have one */
			if (footer) {
				_fnApplyToChildren(zeroOut, footerSrcEls);

				_fnApplyToChildren(function (nSizer) {
					footerContent.push(nSizer.innerHTML);
					footerWidths.push(_fnStringToCss($(nSizer).css('width')));
				}, footerSrcEls);

				_fnApplyToChildren(function (nToSize, i) {
					nToSize.style.width = footerWidths[i];
				}, footerTrgEls);

				$(footerSrcEls).height(0);
			}


			/*
			 * 3. Apply the measurements
			 */

			// "Hide" the header and footer that we used for the sizing. We need to keep
			// the content of the cell so that the width applied to the header and body
			// both match, but we want to hide it completely. We want to also fix their
			// width to what they currently are
			_fnApplyToChildren(function (nSizer, i) {
				nSizer.innerHTML = '<div class="dataTables_sizing">' + headerContent[i] + '</div>';
				nSizer.childNodes[0].style.height = "0";
				nSizer.childNodes[0].style.overflow = "hidden";
				nSizer.style.width = headerWidths[i];
			}, headerSrcEls);

			if (footer) {
				_fnApplyToChildren(function (nSizer, i) {
					nSizer.innerHTML = '<div class="dataTables_sizing">' + footerContent[i] + '</div>';
					nSizer.childNodes[0].style.height = "0";
					nSizer.childNodes[0].style.overflow = "hidden";
					nSizer.style.width = footerWidths[i];
				}, footerSrcEls);
			}

			// Sanity check that the table is of a sensible width. If not then we are going to get
			// misalignment - try to prevent this by not allowing the table to shrink below its min width
			if (Math.round(table.outerWidth()) < Math.round(sanityWidth)) {
				// The min width depends upon if we have a vertical scrollbar visible or not */
				correction = ((divBodyEl.scrollHeight > divBodyEl.offsetHeight ||
					divBody.css('overflow-y') == "scroll")) ?
					sanityWidth + barWidth :
					sanityWidth;

				// IE6/7 are a law unto themselves...
				if (ie67 && (divBodyEl.scrollHeight >
					divBodyEl.offsetHeight || divBody.css('overflow-y') == "scroll")
				) {
					tableStyle.width = _fnStringToCss(correction - barWidth);
				}

				// And give the user a warning that we've stopped the table getting too small
				if (scrollX === "" || scrollXInner !== "") {
					_fnLog(settings, 1, 'Possible column misalignment', 6);
				}
			}
			else {
				correction = '100%';
			}

			// Apply to the container elements
			divBodyStyle.width = _fnStringToCss(correction);
			divHeaderStyle.width = _fnStringToCss(correction);

			if (footer) {
				settings.nScrollFoot.style.width = _fnStringToCss(correction);
			}


			/*
			 * 4. Clean up
			 */
			if (!scrollY) {
				/* IE7< puts a vertical scrollbar in place (when it shouldn't be) due to subtracting
				 * the scrollbar height from the visible display, rather than adding it on. We need to
				 * set the height in order to sort this. Don't want to do it in any other browsers.
				 */
				if (ie67) {
					divBodyStyle.height = _fnStringToCss(tableEl.offsetHeight + barWidth);
				}
			}

			/* Finally set the width's of the header and footer tables */
			var iOuterWidth = table.outerWidth();
			divHeaderTable[0].style.width = _fnStringToCss(iOuterWidth);
			divHeaderInnerStyle.width = _fnStringToCss(iOuterWidth);

			// Figure out if there are scrollbar present - if so then we need a the header and footer to
			// provide a bit more space to allow "overflow" scrolling (i.e. past the scrollbar)
			var bScrolling = table.height() > divBodyEl.clientHeight || divBody.css('overflow-y') == "scroll";
			var padding = 'padding' + (browser.bScrollbarLeft ? 'Left' : 'Right');
			divHeaderInnerStyle[padding] = bScrolling ? barWidth + "px" : "0px";

			if (footer) {
				divFooterTable[0].style.width = _fnStringToCss(iOuterWidth);
				divFooterInner[0].style.width = _fnStringToCss(iOuterWidth);
				divFooterInner[0].style[padding] = bScrolling ? barWidth + "px" : "0px";
			}

			// Correct DOM ordering for colgroup - comes before the thead
			table.children('colgroup').insertBefore(table.children('thead'));

			/* Adjust the position of the header in case we loose the y-scrollbar */
			divBody.trigger('scroll');

			// If sorting or filtering has occurred, jump the scrolling back to the top
			// only if we aren't holding the position
			if ((settings.bSorted || settings.bFiltered) && !settings._drawHold) {
				divBodyEl.scrollTop = 0;
			}
		}



		/**
		 * Apply a given function to the display child nodes of an element array (typically
		 * TD children of TR rows
		 *  @param {function} fn Method to apply to the objects
		 *  @param array {nodes} an1 List of elements to look through for display children
		 *  @param array {nodes} an2 Another list (identical structure to the first) - optional
		 *  @memberof DataTable#oApi
		 */
		function _fnApplyToChildren(fn, an1, an2) {
			var index = 0, i = 0, iLen = an1.length;
			var nNode1, nNode2;

			while (i < iLen) {
				nNode1 = an1[i].firstChild;
				nNode2 = an2 ? an2[i].firstChild : null;

				while (nNode1) {
					if (nNode1.nodeType === 1) {
						if (an2) {
							fn(nNode1, nNode2, index);
						}
						else {
							fn(nNode1, index);
						}

						index++;
					}

					nNode1 = nNode1.nextSibling;
					nNode2 = an2 ? nNode2.nextSibling : null;
				}

				i++;
			}
		}



		var __re_html_remove = /<.*?>/g;


		/**
		 * Calculate the width of columns for the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnCalculateColumnWidths(oSettings) {
			var
				table = oSettings.nTable,
				columns = oSettings.aoColumns,
				scroll = oSettings.oScroll,
				scrollY = scroll.sY,
				scrollX = scroll.sX,
				scrollXInner = scroll.sXInner,
				columnCount = columns.length,
				visibleColumns = _fnGetColumns(oSettings, 'bVisible'),
				headerCells = $('th', oSettings.nTHead),
				tableWidthAttr = table.getAttribute('width'), // from DOM element
				tableContainer = table.parentNode,
				userInputs = false,
				i, column, columnIdx, width, outerWidth,
				browser = oSettings.oBrowser,
				ie67 = browser.bScrollOversize;

			var styleWidth = table.style.width;
			if (styleWidth && styleWidth.indexOf('%') !== -1) {
				tableWidthAttr = styleWidth;
			}

			/* Convert any user input sizes into pixel sizes */
			for (i = 0; i < visibleColumns.length; i++) {
				column = columns[visibleColumns[i]];

				if (column.sWidth !== null) {
					column.sWidth = _fnConvertToWidth(column.sWidthOrig, tableContainer);

					userInputs = true;
				}
			}

			/* If the number of columns in the DOM equals the number that we have to
			 * process in DataTables, then we can use the offsets that are created by
			 * the web- browser. No custom sizes can be set in order for this to happen,
			 * nor scrolling used
			 */
			if (ie67 || !userInputs && !scrollX && !scrollY &&
				columnCount == _fnVisbleColumns(oSettings) &&
				columnCount == headerCells.length
			) {
				for (i = 0; i < columnCount; i++) {
					var colIdx = _fnVisibleToColumnIndex(oSettings, i);

					if (colIdx !== null) {
						columns[colIdx].sWidth = _fnStringToCss(headerCells.eq(i).width());
					}
				}
			}
			else {
				// Otherwise construct a single row, worst case, table with the widest
				// node in the data, assign any user defined widths, then insert it into
				// the DOM and allow the browser to do all the hard work of calculating
				// table widths
				var tmpTable = $(table).clone() // don't use cloneNode - IE8 will remove events on the main table
					.css('visibility', 'hidden')
					.removeAttr('id');

				// Clean up the table body
				tmpTable.find('tbody tr').remove();
				var tr = $('<tr/>').appendTo(tmpTable.find('tbody'));

				// Clone the table header and footer - we can't use the header / footer
				// from the cloned table, since if scrolling is active, the table's
				// real header and footer are contained in different table tags
				tmpTable.find('thead, tfoot').remove();
				tmpTable
					.append($(oSettings.nTHead).clone())
					.append($(oSettings.nTFoot).clone());

				// Remove any assigned widths from the footer (from scrolling)
				tmpTable.find('tfoot th, tfoot td').css('width', '');

				// Apply custom sizing to the cloned header
				headerCells = _fnGetUniqueThs(oSettings, tmpTable.find('thead')[0]);

				for (i = 0; i < visibleColumns.length; i++) {
					column = columns[visibleColumns[i]];

					headerCells[i].style.width = column.sWidthOrig !== null && column.sWidthOrig !== '' ?
						_fnStringToCss(column.sWidthOrig) :
						'';

					// For scrollX we need to force the column width otherwise the
					// browser will collapse it. If this width is smaller than the
					// width the column requires, then it will have no effect
					if (column.sWidthOrig && scrollX) {
						$(headerCells[i]).append($('<div/>').css({
							width: column.sWidthOrig,
							margin: 0,
							padding: 0,
							border: 0,
							height: 1
						}));
					}
				}

				// Find the widest cell for each column and put it into the table
				if (oSettings.aoData.length) {
					for (i = 0; i < visibleColumns.length; i++) {
						columnIdx = visibleColumns[i];
						column = columns[columnIdx];

						$(_fnGetWidestNode(oSettings, columnIdx))
							.clone(false)
							.append(column.sContentPadding)
							.appendTo(tr);
					}
				}

				// Tidy the temporary table - remove name attributes so there aren't
				// duplicated in the dom (radio elements for example)
				$('[name]', tmpTable).removeAttr('name');

				// Table has been built, attach to the document so we can work with it.
				// A holding element is used, positioned at the top of the container
				// with minimal height, so it has no effect on if the container scrolls
				// or not. Otherwise it might trigger scrolling when it actually isn't
				// needed
				var holder = $('<div/>').css(scrollX || scrollY ?
					{
						position: 'absolute',
						top: 0,
						left: 0,
						height: 1,
						right: 0,
						overflow: 'hidden'
					} :
					{}
				)
					.append(tmpTable)
					.appendTo(tableContainer);

				// When scrolling (X or Y) we want to set the width of the table as 
				// appropriate. However, when not scrolling leave the table width as it
				// is. This results in slightly different, but I think correct behaviour
				if (scrollX && scrollXInner) {
					tmpTable.width(scrollXInner);
				}
				else if (scrollX) {
					tmpTable.css('width', 'auto');
					tmpTable.removeAttr('width');

					// If there is no width attribute or style, then allow the table to
					// collapse
					if (tmpTable.width() < tableContainer.clientWidth && tableWidthAttr) {
						tmpTable.width(tableContainer.clientWidth);
					}
				}
				else if (scrollY) {
					tmpTable.width(tableContainer.clientWidth);
				}
				else if (tableWidthAttr) {
					tmpTable.width(tableWidthAttr);
				}

				// Get the width of each column in the constructed table - we need to
				// know the inner width (so it can be assigned to the other table's
				// cells) and the outer width so we can calculate the full width of the
				// table. This is safe since DataTables requires a unique cell for each
				// column, but if ever a header can span multiple columns, this will
				// need to be modified.
				var total = 0;
				for (i = 0; i < visibleColumns.length; i++) {
					var cell = $(headerCells[i]);
					var border = cell.outerWidth() - cell.width();

					// Use getBounding... where possible (not IE8-) because it can give
					// sub-pixel accuracy, which we then want to round up!
					var bounding = browser.bBounding ?
						Math.ceil(headerCells[i].getBoundingClientRect().width) :
						cell.outerWidth();

					// Total is tracked to remove any sub-pixel errors as the outerWidth
					// of the table might not equal the total given here (IE!).
					total += bounding;

					// Width for each column to use
					columns[visibleColumns[i]].sWidth = _fnStringToCss(bounding - border);
				}

				table.style.width = _fnStringToCss(total);

				// Finished with the table - ditch it
				holder.remove();
			}

			// If there is a width attr, we want to attach an event listener which
			// allows the table sizing to automatically adjust when the window is
			// resized. Use the width attr rather than CSS, since we can't know if the
			// CSS is a relative value or absolute - DOM read is always px.
			if (tableWidthAttr) {
				table.style.width = _fnStringToCss(tableWidthAttr);
			}

			if ((tableWidthAttr || scrollX) && !oSettings._reszEvt) {
				var bindResize = function () {
					$(window).on('resize.DT-' + oSettings.sInstance, _fnThrottle(function () {
						_fnAdjustColumnSizing(oSettings);
					}));
				};

				// IE6/7 will crash if we bind a resize event handler on page load.
				// To be removed in 1.11 which drops IE6/7 support
				if (ie67) {
					setTimeout(bindResize, 1000);
				}
				else {
					bindResize();
				}

				oSettings._reszEvt = true;
			}
		}


		/**
		 * Throttle the calls to a function. Arguments and context are maintained for
		 * the throttled function
		 *  @param {function} fn Function to be called
		 *  @param {int} [freq=200] call frequency in mS
		 *  @returns {function} wrapped function
		 *  @memberof DataTable#oApi
		 */
		var _fnThrottle = DataTable.util.throttle;


		/**
		 * Convert a CSS unit width to pixels (e.g. 2em)
		 *  @param {string} width width to be converted
		 *  @param {node} parent parent to get the with for (required for relative widths) - optional
		 *  @returns {int} width in pixels
		 *  @memberof DataTable#oApi
		 */
		function _fnConvertToWidth(width, parent) {
			if (!width) {
				return 0;
			}

			var n = $('<div/>')
				.css('width', _fnStringToCss(width))
				.appendTo(parent || document.body);

			var val = n[0].offsetWidth;
			n.remove();

			return val;
		}


		/**
		 * Get the widest node
		 *  @param {object} settings dataTables settings object
		 *  @param {int} colIdx column of interest
		 *  @returns {node} widest table node
		 *  @memberof DataTable#oApi
		 */
		function _fnGetWidestNode(settings, colIdx) {
			var idx = _fnGetMaxLenString(settings, colIdx);
			if (idx < 0) {
				return null;
			}

			var data = settings.aoData[idx];
			return !data.nTr ? // Might not have been created when deferred rendering
				$('<td/>').html(_fnGetCellData(settings, idx, colIdx, 'display'))[0] :
				data.anCells[colIdx];
		}


		/**
		 * Get the maximum strlen for each data column
		 *  @param {object} settings dataTables settings object
		 *  @param {int} colIdx column of interest
		 *  @returns {string} max string length for each column
		 *  @memberof DataTable#oApi
		 */
		function _fnGetMaxLenString(settings, colIdx) {
			var s, max = -1, maxIdx = -1;

			for (var i = 0, ien = settings.aoData.length; i < ien; i++) {
				s = _fnGetCellData(settings, i, colIdx, 'display') + '';
				s = s.replace(__re_html_remove, '');
				s = s.replace(/&nbsp;/g, ' ');

				if (s.length > max) {
					max = s.length;
					maxIdx = i;
				}
			}

			return maxIdx;
		}


		/**
		 * Append a CSS unit (only if required) to a string
		 *  @param {string} value to css-ify
		 *  @returns {string} value with css unit
		 *  @memberof DataTable#oApi
		 */
		function _fnStringToCss(s) {
			if (s === null) {
				return '0px';
			}

			if (typeof s == 'number') {
				return s < 0 ?
					'0px' :
					s + 'px';
			}

			// Check it has a unit character already
			return s.match(/\d$/) ?
				s + 'px' :
				s;
		}



		function _fnSortFlatten(settings) {
			var
				i, iLen, k, kLen,
				aSort = [],
				aiOrig = [],
				aoColumns = settings.aoColumns,
				aDataSort, iCol, sType, srcCol,
				fixed = settings.aaSortingFixed,
				fixedObj = $.isPlainObject(fixed),
				nestedSort = [],
				add = function (a) {
					if (a.length && !Array.isArray(a[0])) {
						// 1D array
						nestedSort.push(a);
					}
					else {
						// 2D array
						$.merge(nestedSort, a);
					}
				};

			// Build the sort array, with pre-fix and post-fix options if they have been
			// specified
			if (Array.isArray(fixed)) {
				add(fixed);
			}

			if (fixedObj && fixed.pre) {
				add(fixed.pre);
			}

			add(settings.aaSorting);

			if (fixedObj && fixed.post) {
				add(fixed.post);
			}

			for (i = 0; i < nestedSort.length; i++) {
				srcCol = nestedSort[i][0];
				aDataSort = aoColumns[srcCol].aDataSort;

				for (k = 0, kLen = aDataSort.length; k < kLen; k++) {
					iCol = aDataSort[k];
					sType = aoColumns[iCol].sType || 'string';

					if (nestedSort[i]._idx === undefined) {
						nestedSort[i]._idx = $.inArray(nestedSort[i][1], aoColumns[iCol].asSorting);
					}

					aSort.push({
						src: srcCol,
						col: iCol,
						dir: nestedSort[i][1],
						index: nestedSort[i]._idx,
						type: sType,
						formatter: DataTable.ext.type.order[sType + "-pre"]
					});
				}
			}

			return aSort;
		}

		/**
		 * Change the order of the table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 *  @todo This really needs split up!
		 */
		function _fnSort(oSettings) {
			var
				i, ien, iLen, j, jLen, k, kLen,
				sDataType, nTh,
				aiOrig = [],
				oExtSort = DataTable.ext.type.order,
				aoData = oSettings.aoData,
				aoColumns = oSettings.aoColumns,
				aDataSort, data, iCol, sType, oSort,
				formatters = 0,
				sortCol,
				displayMaster = oSettings.aiDisplayMaster,
				aSort;

			// Resolve any column types that are unknown due to addition or invalidation
			// @todo Can this be moved into a 'data-ready' handler which is called when
			//   data is going to be used in the table?
			_fnColumnTypes(oSettings);

			aSort = _fnSortFlatten(oSettings);

			for (i = 0, ien = aSort.length; i < ien; i++) {
				sortCol = aSort[i];

				// Track if we can use the fast sort algorithm
				if (sortCol.formatter) {
					formatters++;
				}

				// Load the data needed for the sort, for each cell
				_fnSortData(oSettings, sortCol.col);
			}

			/* No sorting required if server-side or no sorting array */
			if (_fnDataSource(oSettings) != 'ssp' && aSort.length !== 0) {
				// Create a value - key array of the current row positions such that we can use their
				// current position during the sort, if values match, in order to perform stable sorting
				for (i = 0, iLen = displayMaster.length; i < iLen; i++) {
					aiOrig[displayMaster[i]] = i;
				}

				/* Do the sort - here we want multi-column sorting based on a given data source (column)
				 * and sorting function (from oSort) in a certain direction. It's reasonably complex to
				 * follow on it's own, but this is what we want (example two column sorting):
				 *  fnLocalSorting = function(a,b){
				 *    var iTest;
				 *    iTest = oSort['string-asc']('data11', 'data12');
				 *      if (iTest !== 0)
				 *        return iTest;
				 *    iTest = oSort['numeric-desc']('data21', 'data22');
				 *    if (iTest !== 0)
				 *      return iTest;
				 *    return oSort['numeric-asc']( aiOrig[a], aiOrig[b] );
				 *  }
				 * Basically we have a test for each sorting column, if the data in that column is equal,
				 * test the next column. If all columns match, then we use a numeric sort on the row
				 * positions in the original data array to provide a stable sort.
				 *
				 * Note - I know it seems excessive to have two sorting methods, but the first is around
				 * 15% faster, so the second is only maintained for backwards compatibility with sorting
				 * methods which do not have a pre-sort formatting function.
				 */
				if (formatters === aSort.length) {
					// All sort types have formatting functions
					displayMaster.sort(function (a, b) {
						var
							x, y, k, test, sort,
							len = aSort.length,
							dataA = aoData[a]._aSortData,
							dataB = aoData[b]._aSortData;

						for (k = 0; k < len; k++) {
							sort = aSort[k];

							x = dataA[sort.col];
							y = dataB[sort.col];

							test = x < y ? -1 : x > y ? 1 : 0;
							if (test !== 0) {
								return sort.dir === 'asc' ? test : -test;
							}
						}

						x = aiOrig[a];
						y = aiOrig[b];
						return x < y ? -1 : x > y ? 1 : 0;
					});
				}
				else {
					// Depreciated - remove in 1.11 (providing a plug-in option)
					// Not all sort types have formatting methods, so we have to call their sorting
					// methods.
					displayMaster.sort(function (a, b) {
						var
							x, y, k, l, test, sort, fn,
							len = aSort.length,
							dataA = aoData[a]._aSortData,
							dataB = aoData[b]._aSortData;

						for (k = 0; k < len; k++) {
							sort = aSort[k];

							x = dataA[sort.col];
							y = dataB[sort.col];

							fn = oExtSort[sort.type + "-" + sort.dir] || oExtSort["string-" + sort.dir];
							test = fn(x, y);
							if (test !== 0) {
								return test;
							}
						}

						x = aiOrig[a];
						y = aiOrig[b];
						return x < y ? -1 : x > y ? 1 : 0;
					});
				}
			}

			/* Tell the draw function that we have sorted the data */
			oSettings.bSorted = true;
		}


		function _fnSortAria(settings) {
			var label;
			var nextSort;
			var columns = settings.aoColumns;
			var aSort = _fnSortFlatten(settings);
			var oAria = settings.oLanguage.oAria;

			// ARIA attributes - need to loop all columns, to update all (removing old
			// attributes as needed)
			for (var i = 0, iLen = columns.length; i < iLen; i++) {
				var col = columns[i];
				var asSorting = col.asSorting;
				var sTitle = col.ariaTitle || col.sTitle.replace(/<.*?>/g, "");
				var th = col.nTh;

				// IE7 is throwing an error when setting these properties with jQuery's
				// attr() and removeAttr() methods...
				th.removeAttribute('aria-sort');

				/* In ARIA only the first sorting column can be marked as sorting - no multi-sort option */
				if (col.bSortable) {
					if (aSort.length > 0 && aSort[0].col == i) {
						th.setAttribute('aria-sort', aSort[0].dir == "asc" ? "ascending" : "descending");
						nextSort = asSorting[aSort[0].index + 1] || asSorting[0];
					}
					else {
						nextSort = asSorting[0];
					}

					label = sTitle + (nextSort === "asc" ?
						oAria.sSortAscending :
						oAria.sSortDescending
					);
				}
				else {
					label = sTitle;
				}

				th.setAttribute('aria-label', label);
			}
		}


		/**
		 * Function to run on user sort request
		 *  @param {object} settings dataTables settings object
		 *  @param {node} attachTo node to attach the handler to
		 *  @param {int} colIdx column sorting index
		 *  @param {boolean} [append=false] Append the requested sort to the existing
		 *    sort if true (i.e. multi-column sort)
		 *  @param {function} [callback] callback function
		 *  @memberof DataTable#oApi
		 */
		function _fnSortListener(settings, colIdx, append, callback) {
			var col = settings.aoColumns[colIdx];
			var sorting = settings.aaSorting;
			var asSorting = col.asSorting;
			var nextSortIdx;
			var next = function (a, overflow) {
				var idx = a._idx;
				if (idx === undefined) {
					idx = $.inArray(a[1], asSorting);
				}

				return idx + 1 < asSorting.length ?
					idx + 1 :
					overflow ?
						null :
						0;
			};

			// Convert to 2D array if needed
			if (typeof sorting[0] === 'number') {
				sorting = settings.aaSorting = [sorting];
			}

			// If appending the sort then we are multi-column sorting
			if (append && settings.oFeatures.bSortMulti) {
				// Are we already doing some kind of sort on this column?
				var sortIdx = $.inArray(colIdx, _pluck(sorting, '0'));

				if (sortIdx !== -1) {
					// Yes, modify the sort
					nextSortIdx = next(sorting[sortIdx], true);

					if (nextSortIdx === null && sorting.length === 1) {
						nextSortIdx = 0; // can't remove sorting completely
					}

					if (nextSortIdx === null) {
						sorting.splice(sortIdx, 1);
					}
					else {
						sorting[sortIdx][1] = asSorting[nextSortIdx];
						sorting[sortIdx]._idx = nextSortIdx;
					}
				}
				else {
					// No sort on this column yet
					sorting.push([colIdx, asSorting[0], 0]);
					sorting[sorting.length - 1]._idx = 0;
				}
			}
			else if (sorting.length && sorting[0][0] == colIdx) {
				// Single column - already sorting on this column, modify the sort
				nextSortIdx = next(sorting[0]);

				sorting.length = 1;
				sorting[0][1] = asSorting[nextSortIdx];
				sorting[0]._idx = nextSortIdx;
			}
			else {
				// Single column - sort only on this column
				sorting.length = 0;
				sorting.push([colIdx, asSorting[0]]);
				sorting[0]._idx = 0;
			}

			// Run the sort by calling a full redraw
			_fnReDraw(settings);

			// callback used for async user interaction
			if (typeof callback == 'function') {
				callback(settings);
			}
		}


		/**
		 * Attach a sort handler (click) to a node
		 *  @param {object} settings dataTables settings object
		 *  @param {node} attachTo node to attach the handler to
		 *  @param {int} colIdx column sorting index
		 *  @param {function} [callback] callback function
		 *  @memberof DataTable#oApi
		 */
		function _fnSortAttachListener(settings, attachTo, colIdx, callback) {
			var col = settings.aoColumns[colIdx];

			_fnBindAction(attachTo, {}, function (e) {
				/* If the column is not sortable - don't to anything */
				if (col.bSortable === false) {
					return;
				}

				// If processing is enabled use a timeout to allow the processing
				// display to be shown - otherwise to it synchronously
				if (settings.oFeatures.bProcessing) {
					_fnProcessingDisplay(settings, true);

					setTimeout(function () {
						_fnSortListener(settings, colIdx, e.shiftKey, callback);

						// In server-side processing, the draw callback will remove the
						// processing display
						if (_fnDataSource(settings) !== 'ssp') {
							_fnProcessingDisplay(settings, false);
						}
					}, 0);
				}
				else {
					_fnSortListener(settings, colIdx, e.shiftKey, callback);
				}
			});
		}


		/**
		 * Set the sorting classes on table's body, Note: it is safe to call this function
		 * when bSort and bSortClasses are false
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnSortingClasses(settings) {
			var oldSort = settings.aLastSort;
			var sortClass = settings.oClasses.sSortColumn;
			var sort = _fnSortFlatten(settings);
			var features = settings.oFeatures;
			var i, ien, colIdx;

			if (features.bSort && features.bSortClasses) {
				// Remove old sorting classes
				for (i = 0, ien = oldSort.length; i < ien; i++) {
					colIdx = oldSort[i].src;

					// Remove column sorting
					$(_pluck(settings.aoData, 'anCells', colIdx))
						.removeClass(sortClass + (i < 2 ? i + 1 : 3));
				}

				// Add new column sorting
				for (i = 0, ien = sort.length; i < ien; i++) {
					colIdx = sort[i].src;

					$(_pluck(settings.aoData, 'anCells', colIdx))
						.addClass(sortClass + (i < 2 ? i + 1 : 3));
				}
			}

			settings.aLastSort = sort;
		}


		// Get the data to sort a column, be it from cache, fresh (populating the
		// cache), or from a sort formatter
		function _fnSortData(settings, idx) {
			// Custom sorting function - provided by the sort data type
			var column = settings.aoColumns[idx];
			var customSort = DataTable.ext.order[column.sSortDataType];
			var customData;

			if (customSort) {
				customData = customSort.call(settings.oInstance, settings, idx,
					_fnColumnIndexToVisible(settings, idx)
				);
			}

			// Use / populate cache
			var row, cellData;
			var formatter = DataTable.ext.type.order[column.sType + "-pre"];

			for (var i = 0, ien = settings.aoData.length; i < ien; i++) {
				row = settings.aoData[i];

				if (!row._aSortData) {
					row._aSortData = [];
				}

				if (!row._aSortData[idx] || customSort) {
					cellData = customSort ?
						customData[i] : // If there was a custom sort function, use data from there
						_fnGetCellData(settings, i, idx, 'sort');

					row._aSortData[idx] = formatter ?
						formatter(cellData) :
						cellData;
				}
			}
		}



		/**
		 * Save the state of a table
		 *  @param {object} oSettings dataTables settings object
		 *  @memberof DataTable#oApi
		 */
		function _fnSaveState(settings) {
			if (settings._bLoadingState) {
				return;
			}

			/* Store the interesting variables */
			var state = {
				time: +new Date(),
				start: settings._iDisplayStart,
				length: settings._iDisplayLength,
				order: $.extend(true, [], settings.aaSorting),
				search: _fnSearchToCamel(settings.oPreviousSearch),
				columns: $.map(settings.aoColumns, function (col, i) {
					return {
						visible: col.bVisible,
						search: _fnSearchToCamel(settings.aoPreSearchCols[i])
					};
				})
			};

			settings.oSavedState = state;
			_fnCallbackFire(settings, "aoStateSaveParams", 'stateSaveParams', [settings, state]);

			if (settings.oFeatures.bStateSave && !settings.bDestroying) {
				settings.fnStateSaveCallback.call(settings.oInstance, settings, state);
			}
		}


		/**
		 * Attempt to load a saved table state
		 *  @param {object} oSettings dataTables settings object
		 *  @param {object} oInit DataTables init object so we can override settings
		 *  @param {function} callback Callback to execute when the state has been loaded
		 *  @memberof DataTable#oApi
		 */
		function _fnLoadState(settings, oInit, callback) {
			if (!settings.oFeatures.bStateSave) {
				callback();
				return;
			}

			var loaded = function (state) {
				_fnImplementState(settings, state, callback);
			}

			var state = settings.fnStateLoadCallback.call(settings.oInstance, settings, loaded);

			if (state !== undefined) {
				_fnImplementState(settings, state, callback);
			}
			// otherwise, wait for the loaded callback to be executed

			return true;
		}

		function _fnImplementState(settings, s, callback) {
			var i, ien;
			var columns = settings.aoColumns;
			settings._bLoadingState = true;

			// When StateRestore was introduced the state could now be implemented at any time
			// Not just initialisation. To do this an api instance is required in some places
			var api = settings._bInitComplete ? new DataTable.Api(settings) : null;

			if (!s || !s.time) {
				settings._bLoadingState = false;
				callback();
				return;
			}

			// Allow custom and plug-in manipulation functions to alter the saved data set and
			// cancelling of loading by returning false
			var abStateLoad = _fnCallbackFire(settings, 'aoStateLoadParams', 'stateLoadParams', [settings, s]);
			if ($.inArray(false, abStateLoad) !== -1) {
				settings._bLoadingState = false;
				callback();
				return;
			}

			// Reject old data
			var duration = settings.iStateDuration;
			if (duration > 0 && s.time < +new Date() - (duration * 1000)) {
				settings._bLoadingState = false;
				callback();
				return;
			}

			// Number of columns have changed - all bets are off, no restore of settings
			if (s.columns && columns.length !== s.columns.length) {
				settings._bLoadingState = false;
				callback();
				return;
			}

			// Store the saved state so it might be accessed at any time
			settings.oLoadedState = $.extend(true, {}, s);

			// Page Length
			if (s.length !== undefined) {
				// If already initialised just set the value directly so that the select element is also updated
				if (api) {
					api.page.len(s.length)
				}
				else {
					settings._iDisplayLength = s.length;
				}
			}

			// Restore key features - todo - for 1.11 this needs to be done by
			// subscribed events
			if (s.start !== undefined) {
				if (api === null) {
					settings._iDisplayStart = s.start;
					settings.iInitDisplayStart = s.start;
				}
				else {
					_fnPageChange(settings, s.start / settings._iDisplayLength);
				}
			}

			// Order
			if (s.order !== undefined) {
				settings.aaSorting = [];
				$.each(s.order, function (i, col) {
					settings.aaSorting.push(col[0] >= columns.length ?
						[0, col[1]] :
						col
					);
				});
			}

			// Search
			if (s.search !== undefined) {
				$.extend(settings.oPreviousSearch, _fnSearchToHung(s.search));
			}

			// Columns
			if (s.columns) {
				for (i = 0, ien = s.columns.length; i < ien; i++) {
					var col = s.columns[i];

					// Visibility
					if (col.visible !== undefined) {
						// If the api is defined, the table has been initialised so we need to use it rather than internal settings
						if (api) {
							// Don't redraw the columns on every iteration of this loop, we will do this at the end instead
							api.column(i).visible(col.visible, false);
						}
						else {
							columns[i].bVisible = col.visible;
						}
					}

					// Search
					if (col.search !== undefined) {
						$.extend(settings.aoPreSearchCols[i], _fnSearchToHung(col.search));
					}
				}

				// If the api is defined then we need to adjust the columns once the visibility has been changed
				if (api) {
					api.columns.adjust();
				}
			}

			settings._bLoadingState = false;
			_fnCallbackFire(settings, 'aoStateLoaded', 'stateLoaded', [settings, s]);
			callback();
		};


		/**
		 * Return the settings object for a particular table
		 *  @param {node} table table we are using as a dataTable
		 *  @returns {object} Settings object - or null if not found
		 *  @memberof DataTable#oApi
		 */
		function _fnSettingsFromNode(table) {
			var settings = DataTable.settings;
			var idx = $.inArray(table, _pluck(settings, 'nTable'));

			return idx !== -1 ?
				settings[idx] :
				null;
		}


		/**
		 * Log an error message
		 *  @param {object} settings dataTables settings object
		 *  @param {int} level log error messages, or display them to the user
		 *  @param {string} msg error message
		 *  @param {int} tn Technical note id to get more information about the error.
		 *  @memberof DataTable#oApi
		 */
		function _fnLog(settings, level, msg, tn) {
			msg = 'DataTables warning: ' +
				(settings ? 'table id=' + settings.sTableId + ' - ' : '') + msg;

			if (tn) {
				msg += '. For more information about this error, please see ' +
					'http://datatables.net/tn/' + tn;
			}

			if (!level) {
				// Backwards compatibility pre 1.10
				var ext = DataTable.ext;
				var type = ext.sErrMode || ext.errMode;

				if (settings) {
					_fnCallbackFire(settings, null, 'error', [settings, tn, msg]);
				}

				if (type == 'alert') {
					alert(msg);
				}
				else if (type == 'throw') {
					throw new Error(msg);
				}
				else if (typeof type == 'function') {
					type(settings, tn, msg);
				}
			}
			else if (window.console && console.log) {
				console.log(msg);
			}
		}


		/**
		 * See if a property is defined on one object, if so assign it to the other object
		 *  @param {object} ret target object
		 *  @param {object} src source object
		 *  @param {string} name property
		 *  @param {string} [mappedName] name to map too - optional, name used if not given
		 *  @memberof DataTable#oApi
		 */
		function _fnMap(ret, src, name, mappedName) {
			if (Array.isArray(name)) {
				$.each(name, function (i, val) {
					if (Array.isArray(val)) {
						_fnMap(ret, src, val[0], val[1]);
					}
					else {
						_fnMap(ret, src, val);
					}
				});

				return;
			}

			if (mappedName === undefined) {
				mappedName = name;
			}

			if (src[name] !== undefined) {
				ret[mappedName] = src[name];
			}
		}


		/**
		 * Extend objects - very similar to jQuery.extend, but deep copy objects, and
		 * shallow copy arrays. The reason we need to do this, is that we don't want to
		 * deep copy array init values (such as aaSorting) since the dev wouldn't be
		 * able to override them, but we do want to deep copy arrays.
		 *  @param {object} out Object to extend
		 *  @param {object} extender Object from which the properties will be applied to
		 *      out
		 *  @param {boolean} breakRefs If true, then arrays will be sliced to take an
		 *      independent copy with the exception of the `data` or `aaData` parameters
		 *      if they are present. This is so you can pass in a collection to
		 *      DataTables and have that used as your data source without breaking the
		 *      references
		 *  @returns {object} out Reference, just for convenience - out === the return.
		 *  @memberof DataTable#oApi
		 *  @todo This doesn't take account of arrays inside the deep copied objects.
		 */
		function _fnExtend(out, extender, breakRefs) {
			var val;

			for (var prop in extender) {
				if (extender.hasOwnProperty(prop)) {
					val = extender[prop];

					if ($.isPlainObject(val)) {
						if (!$.isPlainObject(out[prop])) {
							out[prop] = {};
						}
						$.extend(true, out[prop], val);
					}
					else if (breakRefs && prop !== 'data' && prop !== 'aaData' && Array.isArray(val)) {
						out[prop] = val.slice();
					}
					else {
						out[prop] = val;
					}
				}
			}

			return out;
		}


		/**
		 * Bind an event handers to allow a click or return key to activate the callback.
		 * This is good for accessibility since a return on the keyboard will have the
		 * same effect as a click, if the element has focus.
		 *  @param {element} n Element to bind the action to
		 *  @param {object} oData Data object to pass to the triggered function
		 *  @param {function} fn Callback function for when the event is triggered
		 *  @memberof DataTable#oApi
		 */
		function _fnBindAction(n, oData, fn) {
			$(n)
				.on('click.DT', oData, function (e) {
					$(n).trigger('blur'); // Remove focus outline for mouse users
					fn(e);
				})
				.on('keypress.DT', oData, function (e) {
					if (e.which === 13) {
						e.preventDefault();
						fn(e);
					}
				})
				.on('selectstart.DT', function () {
					/* Take the brutal approach to cancelling text selection */
					return false;
				});
		}


		/**
		 * Register a callback function. Easily allows a callback function to be added to
		 * an array store of callback functions that can then all be called together.
		 *  @param {object} oSettings dataTables settings object
		 *  @param {string} sStore Name of the array storage for the callbacks in oSettings
		 *  @param {function} fn Function to be called back
		 *  @param {string} sName Identifying name for the callback (i.e. a label)
		 *  @memberof DataTable#oApi
		 */
		function _fnCallbackReg(oSettings, sStore, fn, sName) {
			if (fn) {
				oSettings[sStore].push({
					"fn": fn,
					"sName": sName
				});
			}
		}


		/**
		 * Fire callback functions and trigger events. Note that the loop over the
		 * callback array store is done backwards! Further note that you do not want to
		 * fire off triggers in time sensitive applications (for example cell creation)
		 * as its slow.
		 *  @param {object} settings dataTables settings object
		 *  @param {string} callbackArr Name of the array storage for the callbacks in
		 *      oSettings
		 *  @param {string} eventName Name of the jQuery custom event to trigger. If
		 *      null no trigger is fired
		 *  @param {array} args Array of arguments to pass to the callback function /
		 *      trigger
		 *  @memberof DataTable#oApi
		 */
		function _fnCallbackFire(settings, callbackArr, eventName, args) {
			var ret = [];

			if (callbackArr) {
				ret = $.map(settings[callbackArr].slice().reverse(), function (val, i) {
					return val.fn.apply(settings.oInstance, args);
				});
			}

			if (eventName !== null) {
				var e = $.Event(eventName + '.dt');
				var table = $(settings.nTable);

				table.trigger(e, args);

				// If not yet attached to the document, trigger the event
				// on the body directly to sort of simulate the bubble
				if (table.parents('body').length === 0) {
					$('body').trigger(e, args);
				}

				ret.push(e.result);
			}

			return ret;
		}


		function _fnLengthOverflow(settings) {
			var
				start = settings._iDisplayStart,
				end = settings.fnDisplayEnd(),
				len = settings._iDisplayLength;

			/* If we have space to show extra rows (backing up from the end point - then do so */
			if (start >= end) {
				start = end - len;
			}

			// Keep the start record on the current page
			start -= (start % len);

			if (len === -1 || start < 0) {
				start = 0;
			}

			settings._iDisplayStart = start;
		}


		function _fnRenderer(settings, type) {
			var renderer = settings.renderer;
			var host = DataTable.ext.renderer[type];

			if ($.isPlainObject(renderer) && renderer[type]) {
				// Specific renderer for this type. If available use it, otherwise use
				// the default.
				return host[renderer[type]] || host._;
			}
			else if (typeof renderer === 'string') {
				// Common renderer - if there is one available for this type use it,
				// otherwise use the default
				return host[renderer] || host._;
			}

			// Use the default
			return host._;
		}


		/**
		 * Detect the data source being used for the table. Used to simplify the code
		 * a little (ajax) and to make it compress a little smaller.
		 *
		 *  @param {object} settings dataTables settings object
		 *  @returns {string} Data source
		 *  @memberof DataTable#oApi
		 */
		function _fnDataSource(settings) {
			if (settings.oFeatures.bServerSide) {
				return 'ssp';
			}
			else if (settings.ajax || settings.sAjaxSource) {
				return 'ajax';
			}
			return 'dom';
		}




		/**
		 * Computed structure of the DataTables API, defined by the options passed to
		 * `DataTable.Api.register()` when building the API.
		 *
		 * The structure is built in order to speed creation and extension of the Api
		 * objects since the extensions are effectively pre-parsed.
		 *
		 * The array is an array of objects with the following structure, where this
		 * base array represents the Api prototype base:
		 *
		 *     [
		 *       {
		 *         name:      'data'                -- string   - Property name
		 *         val:       function () {},       -- function - Api method (or undefined if just an object
		 *         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
		 *         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
		 *       },
		 *       {
		 *         name:     'row'
		 *         val:       {},
		 *         methodExt: [ ... ],
		 *         propExt:   [
		 *           {
		 *             name:      'data'
		 *             val:       function () {},
		 *             methodExt: [ ... ],
		 *             propExt:   [ ... ]
		 *           },
		 *           ...
		 *         ]
		 *       }
		 *     ]
		 *
		 * @type {Array}
		 * @ignore
		 */
		var __apiStruct = [];


		/**
		 * `Array.prototype` reference.
		 *
		 * @type object
		 * @ignore
		 */
		var __arrayProto = Array.prototype;


		/**
		 * Abstraction for `context` parameter of the `Api` constructor to allow it to
		 * take several different forms for ease of use.
		 *
		 * Each of the input parameter types will be converted to a DataTables settings
		 * object where possible.
		 *
		 * @param  {string|node|jQuery|object} mixed DataTable identifier. Can be one
		 *   of:
		 *
		 *   * `string` - jQuery selector. Any DataTables' matching the given selector
		 *     with be found and used.
		 *   * `node` - `TABLE` node which has already been formed into a DataTable.
		 *   * `jQuery` - A jQuery object of `TABLE` nodes.
		 *   * `object` - DataTables settings object
		 *   * `DataTables.Api` - API instance
		 * @return {array|null} Matching DataTables settings objects. `null` or
		 *   `undefined` is returned if no matching DataTable is found.
		 * @ignore
		 */
		var _toSettings = function (mixed) {
			var idx, jq;
			var settings = DataTable.settings;
			var tables = $.map(settings, function (el, i) {
				return el.nTable;
			});

			if (!mixed) {
				return [];
			}
			else if (mixed.nTable && mixed.oApi) {
				// DataTables settings object
				return [mixed];
			}
			else if (mixed.nodeName && mixed.nodeName.toLowerCase() === 'table') {
				// Table node
				idx = $.inArray(mixed, tables);
				return idx !== -1 ? [settings[idx]] : null;
			}
			else if (mixed && typeof mixed.settings === 'function') {
				return mixed.settings().toArray();
			}
			else if (typeof mixed === 'string') {
				// jQuery selector
				jq = $(mixed);
			}
			else if (mixed instanceof $) {
				// jQuery object (also DataTables instance)
				jq = mixed;
			}

			if (jq) {
				return jq.map(function (i) {
					idx = $.inArray(this, tables);
					return idx !== -1 ? settings[idx] : null;
				}).toArray();
			}
		};


		/**
		 * DataTables API class - used to control and interface with  one or more
		 * DataTables enhanced tables.
		 *
		 * The API class is heavily based on jQuery, presenting a chainable interface
		 * that you can use to interact with tables. Each instance of the API class has
		 * a "context" - i.e. the tables that it will operate on. This could be a single
		 * table, all tables on a page or a sub-set thereof.
		 *
		 * Additionally the API is designed to allow you to easily work with the data in
		 * the tables, retrieving and manipulating it as required. This is done by
		 * presenting the API class as an array like interface. The contents of the
		 * array depend upon the actions requested by each method (for example
		 * `rows().nodes()` will return an array of nodes, while `rows().data()` will
		 * return an array of objects or arrays depending upon your table's
		 * configuration). The API object has a number of array like methods (`push`,
		 * `pop`, `reverse` etc) as well as additional helper methods (`each`, `pluck`,
		 * `unique` etc) to assist your working with the data held in a table.
		 *
		 * Most methods (those which return an Api instance) are chainable, which means
		 * the return from a method call also has all of the methods available that the
		 * top level object had. For example, these two calls are equivalent:
		 *
		 *     // Not chained
		 *     api.row.add( {...} );
		 *     api.draw();
		 *
		 *     // Chained
		 *     api.row.add( {...} ).draw();
		 *
		 * @class DataTable.Api
		 * @param {array|object|string|jQuery} context DataTable identifier. This is
		 *   used to define which DataTables enhanced tables this API will operate on.
		 *   Can be one of:
		 *
		 *   * `string` - jQuery selector. Any DataTables' matching the given selector
		 *     with be found and used.
		 *   * `node` - `TABLE` node which has already been formed into a DataTable.
		 *   * `jQuery` - A jQuery object of `TABLE` nodes.
		 *   * `object` - DataTables settings object
		 * @param {array} [data] Data to initialise the Api instance with.
		 *
		 * @example
		 *   // Direct initialisation during DataTables construction
		 *   var api = $('#example').DataTable();
		 *
		 * @example
		 *   // Initialisation using a DataTables jQuery object
		 *   var api = $('#example').dataTable().api();
		 *
		 * @example
		 *   // Initialisation as a constructor
		 *   var api = new $.fn.DataTable.Api( 'table.dataTable' );
		 */
		_Api = function (context, data) {
			if (!(this instanceof _Api)) {
				return new _Api(context, data);
			}

			var settings = [];
			var ctxSettings = function (o) {
				var a = _toSettings(o);
				if (a) {
					settings.push.apply(settings, a);
				}
			};

			if (Array.isArray(context)) {
				for (var i = 0, ien = context.length; i < ien; i++) {
					ctxSettings(context[i]);
				}
			}
			else {
				ctxSettings(context);
			}

			// Remove duplicates
			this.context = _unique(settings);

			// Initial data
			if (data) {
				$.merge(this, data);
			}

			// selector
			this.selector = {
				rows: null,
				cols: null,
				opts: null
			};

			_Api.extend(this, this, __apiStruct);
		};

		DataTable.Api = _Api;

		// Don't destroy the existing prototype, just extend it. Required for jQuery 2's
		// isPlainObject.
		$.extend(_Api.prototype, {
			any: function () {
				return this.count() !== 0;
			},


			concat: __arrayProto.concat,


			context: [], // array of table settings objects


			count: function () {
				return this.flatten().length;
			},


			each: function (fn) {
				for (var i = 0, ien = this.length; i < ien; i++) {
					fn.call(this, this[i], i, this);
				}

				return this;
			},


			eq: function (idx) {
				var ctx = this.context;

				return ctx.length > idx ?
					new _Api(ctx[idx], this[idx]) :
					null;
			},


			filter: function (fn) {
				var a = [];

				if (__arrayProto.filter) {
					a = __arrayProto.filter.call(this, fn, this);
				}
				else {
					// Compatibility for browsers without EMCA-252-5 (JS 1.6)
					for (var i = 0, ien = this.length; i < ien; i++) {
						if (fn.call(this, this[i], i, this)) {
							a.push(this[i]);
						}
					}
				}

				return new _Api(this.context, a);
			},


			flatten: function () {
				var a = [];
				return new _Api(this.context, a.concat.apply(a, this.toArray()));
			},


			join: __arrayProto.join,


			indexOf: __arrayProto.indexOf || function (obj, start) {
				for (var i = (start || 0), ien = this.length; i < ien; i++) {
					if (this[i] === obj) {
						return i;
					}
				}
				return -1;
			},

			iterator: function (flatten, type, fn, alwaysNew) {
				var
					a = [], ret,
					i, ien, j, jen,
					context = this.context,
					rows, items, item,
					selector = this.selector;

				// Argument shifting
				if (typeof flatten === 'string') {
					alwaysNew = fn;
					fn = type;
					type = flatten;
					flatten = false;
				}

				for (i = 0, ien = context.length; i < ien; i++) {
					var apiInst = new _Api(context[i]);

					if (type === 'table') {
						ret = fn.call(apiInst, context[i], i);

						if (ret !== undefined) {
							a.push(ret);
						}
					}
					else if (type === 'columns' || type === 'rows') {
						// this has same length as context - one entry for each table
						ret = fn.call(apiInst, context[i], this[i], i);

						if (ret !== undefined) {
							a.push(ret);
						}
					}
					else if (type === 'column' || type === 'column-rows' || type === 'row' || type === 'cell') {
						// columns and rows share the same structure.
						// 'this' is an array of column indexes for each context
						items = this[i];

						if (type === 'column-rows') {
							rows = _selector_row_indexes(context[i], selector.opts);
						}

						for (j = 0, jen = items.length; j < jen; j++) {
							item = items[j];

							if (type === 'cell') {
								ret = fn.call(apiInst, context[i], item.row, item.column, i, j);
							}
							else {
								ret = fn.call(apiInst, context[i], item, i, j, rows);
							}

							if (ret !== undefined) {
								a.push(ret);
							}
						}
					}
				}

				if (a.length || alwaysNew) {
					var api = new _Api(context, flatten ? a.concat.apply([], a) : a);
					var apiSelector = api.selector;
					apiSelector.rows = selector.rows;
					apiSelector.cols = selector.cols;
					apiSelector.opts = selector.opts;
					return api;
				}
				return this;
			},


			lastIndexOf: __arrayProto.lastIndexOf || function (obj, start) {
				// Bit cheeky...
				return this.indexOf.apply(this.toArray.reverse(), arguments);
			},


			length: 0,


			map: function (fn) {
				var a = [];

				if (__arrayProto.map) {
					a = __arrayProto.map.call(this, fn, this);
				}
				else {
					// Compatibility for browsers without EMCA-252-5 (JS 1.6)
					for (var i = 0, ien = this.length; i < ien; i++) {
						a.push(fn.call(this, this[i], i));
					}
				}

				return new _Api(this.context, a);
			},


			pluck: function (prop) {
				var fn = DataTable.util.get(prop);

				return this.map(function (el) {
					return fn(el);
				});
			},

			pop: __arrayProto.pop,


			push: __arrayProto.push,


			// Does not return an API instance
			reduce: __arrayProto.reduce || function (fn, init) {
				return _fnReduce(this, fn, init, 0, this.length, 1);
			},


			reduceRight: __arrayProto.reduceRight || function (fn, init) {
				return _fnReduce(this, fn, init, this.length - 1, -1, -1);
			},


			reverse: __arrayProto.reverse,


			// Object with rows, columns and opts
			selector: null,


			shift: __arrayProto.shift,


			slice: function () {
				return new _Api(this.context, this);
			},


			sort: __arrayProto.sort, // ? name - order?


			splice: __arrayProto.splice,


			toArray: function () {
				return __arrayProto.slice.call(this);
			},


			to$: function () {
				return $(this);
			},


			toJQuery: function () {
				return $(this);
			},


			unique: function () {
				return new _Api(this.context, _unique(this));
			},


			unshift: __arrayProto.unshift
		});


		_Api.extend = function (scope, obj, ext) {
			// Only extend API instances and static properties of the API
			if (!ext.length || !obj || (!(obj instanceof _Api) && !obj.__dt_wrapper)) {
				return;
			}

			var
				i, ien,
				struct,
				methodScoping = function (scope, fn, struc) {
					return function () {
						var ret = fn.apply(scope, arguments);

						// Method extension
						_Api.extend(ret, ret, struc.methodExt);
						return ret;
					};
				};

			for (i = 0, ien = ext.length; i < ien; i++) {
				struct = ext[i];

				// Value
				obj[struct.name] = struct.type === 'function' ?
					methodScoping(scope, struct.val, struct) :
					struct.type === 'object' ?
						{} :
						struct.val;

				obj[struct.name].__dt_wrapper = true;

				// Property extension
				_Api.extend(scope, obj[struct.name], struct.propExt);
			}
		};


		// @todo - Is there need for an augment function?
		// _Api.augment = function ( inst, name )
		// {
		// 	// Find src object in the structure from the name
		// 	var parts = name.split('.');

		// 	_Api.extend( inst, obj );
		// };


		//     [
		//       {
		//         name:      'data'                -- string   - Property name
		//         val:       function () {},       -- function - Api method (or undefined if just an object
		//         methodExt: [ ... ],              -- array    - Array of Api object definitions to extend the method result
		//         propExt:   [ ... ]               -- array    - Array of Api object definitions to extend the property
		//       },
		//       {
		//         name:     'row'
		//         val:       {},
		//         methodExt: [ ... ],
		//         propExt:   [
		//           {
		//             name:      'data'
		//             val:       function () {},
		//             methodExt: [ ... ],
		//             propExt:   [ ... ]
		//           },
		//           ...
		//         ]
		//       }
		//     ]

		_Api.register = _api_register = function (name, val) {
			if (Array.isArray(name)) {
				for (var j = 0, jen = name.length; j < jen; j++) {
					_Api.register(name[j], val);
				}
				return;
			}

			var
				i, ien,
				heir = name.split('.'),
				struct = __apiStruct,
				key, method;

			var find = function (src, name) {
				for (var i = 0, ien = src.length; i < ien; i++) {
					if (src[i].name === name) {
						return src[i];
					}
				}
				return null;
			};

			for (i = 0, ien = heir.length; i < ien; i++) {
				method = heir[i].indexOf('()') !== -1;
				key = method ?
					heir[i].replace('()', '') :
					heir[i];

				var src = find(struct, key);
				if (!src) {
					src = {
						name: key,
						val: {},
						methodExt: [],
						propExt: [],
						type: 'object'
					};
					struct.push(src);
				}

				if (i === ien - 1) {
					src.val = val;
					src.type = typeof val === 'function' ?
						'function' :
						$.isPlainObject(val) ?
							'object' :
							'other';
				}
				else {
					struct = method ?
						src.methodExt :
						src.propExt;
				}
			}
		};

		_Api.registerPlural = _api_registerPlural = function (pluralName, singularName, val) {
			_Api.register(pluralName, val);

			_Api.register(singularName, function () {
				var ret = val.apply(this, arguments);

				if (ret === this) {
					// Returned item is the API instance that was passed in, return it
					return this;
				}
				else if (ret instanceof _Api) {
					// New API instance returned, want the value from the first item
					// in the returned array for the singular result.
					return ret.length ?
						Array.isArray(ret[0]) ?
							new _Api(ret.context, ret[0]) : // Array results are 'enhanced'
							ret[0] :
						undefined;
				}

				// Non-API return - just fire it back
				return ret;
			});
		};


		/**
		 * Selector for HTML tables. Apply the given selector to the give array of
		 * DataTables settings objects.
		 *
		 * @param {string|integer} [selector] jQuery selector string or integer
		 * @param  {array} Array of DataTables settings objects to be filtered
		 * @return {array}
		 * @ignore
		 */
		var __table_selector = function (selector, a) {
			if (Array.isArray(selector)) {
				return $.map(selector, function (item) {
					return __table_selector(item, a);
				});
			}

			// Integer is used to pick out a table by index
			if (typeof selector === 'number') {
				return [a[selector]];
			}

			// Perform a jQuery selector on the table nodes
			var nodes = $.map(a, function (el, i) {
				return el.nTable;
			});

			return $(nodes)
				.filter(selector)
				.map(function (i) {
					// Need to translate back from the table node to the settings
					var idx = $.inArray(this, nodes);
					return a[idx];
				})
				.toArray();
		};



		/**
		 * Context selector for the API's context (i.e. the tables the API instance
		 * refers to.
		 *
		 * @name    DataTable.Api#tables
		 * @param {string|integer} [selector] Selector to pick which tables the iterator
		 *   should operate on. If not given, all tables in the current context are
		 *   used. This can be given as a jQuery selector (for example `':gt(0)'`) to
		 *   select multiple tables or as an integer to select a single table.
		 * @returns {DataTable.Api} Returns a new API instance if a selector is given.
		 */
		_api_register('tables()', function (selector) {
			// A new instance is created if there was a selector specified
			return selector !== undefined && selector !== null ?
				new _Api(__table_selector(selector, this.context)) :
				this;
		});


		_api_register('table()', function (selector) {
			var tables = this.tables(selector);
			var ctx = tables.context;

			// Truncate to the first matched table
			return ctx.length ?
				new _Api(ctx[0]) :
				tables;
		});


		_api_registerPlural('tables().nodes()', 'table().node()', function () {
			return this.iterator('table', function (ctx) {
				return ctx.nTable;
			}, 1);
		});


		_api_registerPlural('tables().body()', 'table().body()', function () {
			return this.iterator('table', function (ctx) {
				return ctx.nTBody;
			}, 1);
		});


		_api_registerPlural('tables().header()', 'table().header()', function () {
			return this.iterator('table', function (ctx) {
				return ctx.nTHead;
			}, 1);
		});


		_api_registerPlural('tables().footer()', 'table().footer()', function () {
			return this.iterator('table', function (ctx) {
				return ctx.nTFoot;
			}, 1);
		});


		_api_registerPlural('tables().containers()', 'table().container()', function () {
			return this.iterator('table', function (ctx) {
				return ctx.nTableWrapper;
			}, 1);
		});



		/**
		 * Redraw the tables in the current context.
		 */
		_api_register('draw()', function (paging) {
			return this.iterator('table', function (settings) {
				if (paging === 'page') {
					_fnDraw(settings);
				}
				else {
					if (typeof paging === 'string') {
						paging = paging === 'full-hold' ?
							false :
							true;
					}

					_fnReDraw(settings, paging === false);
				}
			});
		});



		/**
		 * Get the current page index.
		 *
		 * @return {integer} Current page index (zero based)
		 *//**
		* Set the current page.
		*
		* Note that if you attempt to show a page which does not exist, DataTables will
		* not throw an error, but rather reset the paging.
		*
		* @param {integer|string} action The paging action to take. This can be one of:
		*  * `integer` - The page index to jump to
		*  * `string` - An action to take:
		*    * `first` - Jump to first page.
		*    * `next` - Jump to the next page
		*    * `previous` - Jump to previous page
		*    * `last` - Jump to the last page.
		* @returns {DataTables.Api} this
		*/
		_api_register('page()', function (action) {
			if (action === undefined) {
				return this.page.info().page; // not an expensive call
			}

			// else, have an action to take on all tables
			return this.iterator('table', function (settings) {
				_fnPageChange(settings, action);
			});
		});


		/**
		 * Paging information for the first table in the current context.
		 *
		 * If you require paging information for another table, use the `table()` method
		 * with a suitable selector.
		 *
		 * @return {object} Object with the following properties set:
		 *  * `page` - Current page index (zero based - i.e. the first page is `0`)
		 *  * `pages` - Total number of pages
		 *  * `start` - Display index for the first record shown on the current page
		 *  * `end` - Display index for the last record shown on the current page
		 *  * `length` - Display length (number of records). Note that generally `start
		 *    + length = end`, but this is not always true, for example if there are
		 *    only 2 records to show on the final page, with a length of 10.
		 *  * `recordsTotal` - Full data set length
		 *  * `recordsDisplay` - Data set length once the current filtering criterion
		 *    are applied.
		 */
		_api_register('page.info()', function (action) {
			if (this.context.length === 0) {
				return undefined;
			}

			var
				settings = this.context[0],
				start = settings._iDisplayStart,
				len = settings.oFeatures.bPaginate ? settings._iDisplayLength : -1,
				visRecords = settings.fnRecordsDisplay(),
				all = len === -1;

			return {
				"page": all ? 0 : Math.floor(start / len),
				"pages": all ? 1 : Math.ceil(visRecords / len),
				"start": start,
				"end": settings.fnDisplayEnd(),
				"length": len,
				"recordsTotal": settings.fnRecordsTotal(),
				"recordsDisplay": visRecords,
				"serverSide": _fnDataSource(settings) === 'ssp'
			};
		});


		/**
		 * Get the current page length.
		 *
		 * @return {integer} Current page length. Note `-1` indicates that all records
		 *   are to be shown.
		 *//**
		* Set the current page length.
		*
		* @param {integer} Page length to set. Use `-1` to show all records.
		* @returns {DataTables.Api} this
		*/
		_api_register('page.len()', function (len) {
			// Note that we can't call this function 'length()' because `length`
			// is a Javascript property of functions which defines how many arguments
			// the function expects.
			if (len === undefined) {
				return this.context.length !== 0 ?
					this.context[0]._iDisplayLength :
					undefined;
			}

			// else, set the page length
			return this.iterator('table', function (settings) {
				_fnLengthChange(settings, len);
			});
		});



		var __reload = function (settings, holdPosition, callback) {
			// Use the draw event to trigger a callback
			if (callback) {
				var api = new _Api(settings);

				api.one('draw', function () {
					callback(api.ajax.json());
				});
			}

			if (_fnDataSource(settings) == 'ssp') {
				_fnReDraw(settings, holdPosition);
			}
			else {
				_fnProcessingDisplay(settings, true);

				// Cancel an existing request
				var xhr = settings.jqXHR;
				if (xhr && xhr.readyState !== 4) {
					xhr.abort();
				}

				// Trigger xhr
				_fnBuildAjax(settings, [], function (json) {
					_fnClearTable(settings);

					var data = _fnAjaxDataSrc(settings, json);
					for (var i = 0, ien = data.length; i < ien; i++) {
						_fnAddData(settings, data[i]);
					}

					_fnReDraw(settings, holdPosition);
					_fnProcessingDisplay(settings, false);
				});
			}
		};


		/**
		 * Get the JSON response from the last Ajax request that DataTables made to the
		 * server. Note that this returns the JSON from the first table in the current
		 * context.
		 *
		 * @return {object} JSON received from the server.
		 */
		_api_register('ajax.json()', function () {
			var ctx = this.context;

			if (ctx.length > 0) {
				return ctx[0].json;
			}

			// else return undefined;
		});


		/**
		 * Get the data submitted in the last Ajax request
		 */
		_api_register('ajax.params()', function () {
			var ctx = this.context;

			if (ctx.length > 0) {
				return ctx[0].oAjaxData;
			}

			// else return undefined;
		});


		/**
		 * Reload tables from the Ajax data source. Note that this function will
		 * automatically re-draw the table when the remote data has been loaded.
		 *
		 * @param {boolean} [reset=true] Reset (default) or hold the current paging
		 *   position. A full re-sort and re-filter is performed when this method is
		 *   called, which is why the pagination reset is the default action.
		 * @returns {DataTables.Api} this
		 */
		_api_register('ajax.reload()', function (callback, resetPaging) {
			return this.iterator('table', function (settings) {
				__reload(settings, resetPaging === false, callback);
			});
		});


		/**
		 * Get the current Ajax URL. Note that this returns the URL from the first
		 * table in the current context.
		 *
		 * @return {string} Current Ajax source URL
		 *//**
		* Set the Ajax URL. Note that this will set the URL for all tables in the
		* current context.
		*
		* @param {string} url URL to set.
		* @returns {DataTables.Api} this
		*/
		_api_register('ajax.url()', function (url) {
			var ctx = this.context;

			if (url === undefined) {
				// get
				if (ctx.length === 0) {
					return undefined;
				}
				ctx = ctx[0];

				return ctx.ajax ?
					$.isPlainObject(ctx.ajax) ?
						ctx.ajax.url :
						ctx.ajax :
					ctx.sAjaxSource;
			}

			// set
			return this.iterator('table', function (settings) {
				if ($.isPlainObject(settings.ajax)) {
					settings.ajax.url = url;
				}
				else {
					settings.ajax = url;
				}
				// No need to consider sAjaxSource here since DataTables gives priority
				// to `ajax` over `sAjaxSource`. So setting `ajax` here, renders any
				// value of `sAjaxSource` redundant.
			});
		});


		/**
		 * Load data from the newly set Ajax URL. Note that this method is only
		 * available when `ajax.url()` is used to set a URL. Additionally, this method
		 * has the same effect as calling `ajax.reload()` but is provided for
		 * convenience when setting a new URL. Like `ajax.reload()` it will
		 * automatically redraw the table once the remote data has been loaded.
		 *
		 * @returns {DataTables.Api} this
		 */
		_api_register('ajax.url().load()', function (callback, resetPaging) {
			// Same as a reload, but makes sense to present it for easy access after a
			// url change
			return this.iterator('table', function (ctx) {
				__reload(ctx, resetPaging === false, callback);
			});
		});




		var _selector_run = function (type, selector, selectFn, settings, opts) {
			var
				out = [], res,
				a, i, ien, j, jen,
				selectorType = typeof selector;

			// Can't just check for isArray here, as an API or jQuery instance might be
			// given with their array like look
			if (!selector || selectorType === 'string' || selectorType === 'function' || selector.length === undefined) {
				selector = [selector];
			}

			for (i = 0, ien = selector.length; i < ien; i++) {
				// Only split on simple strings - complex expressions will be jQuery selectors
				a = selector[i] && selector[i].split && !selector[i].match(/[\[\(:]/) ?
					selector[i].split(',') :
					[selector[i]];

				for (j = 0, jen = a.length; j < jen; j++) {
					res = selectFn(typeof a[j] === 'string' ? (a[j]).trim() : a[j]);

					if (res && res.length) {
						out = out.concat(res);
					}
				}
			}

			// selector extensions
			var ext = _ext.selector[type];
			if (ext.length) {
				for (i = 0, ien = ext.length; i < ien; i++) {
					out = ext[i](settings, opts, out);
				}
			}

			return _unique(out);
		};


		var _selector_opts = function (opts) {
			if (!opts) {
				opts = {};
			}

			// Backwards compatibility for 1.9- which used the terminology filter rather
			// than search
			if (opts.filter && opts.search === undefined) {
				opts.search = opts.filter;
			}

			return $.extend({
				search: 'none',
				order: 'current',
				page: 'all'
			}, opts);
		};


		var _selector_first = function (inst) {
			// Reduce the API instance to the first item found
			for (var i = 0, ien = inst.length; i < ien; i++) {
				if (inst[i].length > 0) {
					// Assign the first element to the first item in the instance
					// and truncate the instance and context
					inst[0] = inst[i];
					inst[0].length = 1;
					inst.length = 1;
					inst.context = [inst.context[i]];

					return inst;
				}
			}

			// Not found - return an empty instance
			inst.length = 0;
			return inst;
		};


		var _selector_row_indexes = function (settings, opts) {
			var
				i, ien, tmp, a = [],
				displayFiltered = settings.aiDisplay,
				displayMaster = settings.aiDisplayMaster;

			var
				search = opts.search,  // none, applied, removed
				order = opts.order,   // applied, current, index (original - compatibility with 1.9)
				page = opts.page;    // all, current

			if (_fnDataSource(settings) == 'ssp') {
				// In server-side processing mode, most options are irrelevant since
				// rows not shown don't exist and the index order is the applied order
				// Removed is a special case - for consistency just return an empty
				// array
				return search === 'removed' ?
					[] :
					_range(0, displayMaster.length);
			}
			else if (page == 'current') {
				// Current page implies that order=current and filter=applied, since it is
				// fairly senseless otherwise, regardless of what order and search actually
				// are
				for (i = settings._iDisplayStart, ien = settings.fnDisplayEnd(); i < ien; i++) {
					a.push(displayFiltered[i]);
				}
			}
			else if (order == 'current' || order == 'applied') {
				if (search == 'none') {
					a = displayMaster.slice();
				}
				else if (search == 'applied') {
					a = displayFiltered.slice();
				}
				else if (search == 'removed') {
					// O(n+m) solution by creating a hash map
					var displayFilteredMap = {};

					for (var i = 0, ien = displayFiltered.length; i < ien; i++) {
						displayFilteredMap[displayFiltered[i]] = null;
					}

					a = $.map(displayMaster, function (el) {
						return !displayFilteredMap.hasOwnProperty(el) ?
							el :
							null;
					});
				}
			}
			else if (order == 'index' || order == 'original') {
				for (i = 0, ien = settings.aoData.length; i < ien; i++) {
					if (search == 'none') {
						a.push(i);
					}
					else { // applied | removed
						tmp = $.inArray(i, displayFiltered);

						if ((tmp === -1 && search == 'removed') ||
							(tmp >= 0 && search == 'applied')) {
							a.push(i);
						}
					}
				}
			}

			return a;
		};


		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Rows
		 *
		 * {}          - no selector - use all available rows
		 * {integer}   - row aoData index
		 * {node}      - TR node
		 * {string}    - jQuery selector to apply to the TR elements
		 * {array}     - jQuery array of nodes, or simply an array of TR nodes
		 *
		 */
		var __row_selector = function (settings, selector, opts) {
			var rows;
			var run = function (sel) {
				var selInt = _intVal(sel);
				var i, ien;
				var aoData = settings.aoData;

				// Short cut - selector is a number and no options provided (default is
				// all records, so no need to check if the index is in there, since it
				// must be - dev error if the index doesn't exist).
				if (selInt !== null && !opts) {
					return [selInt];
				}

				if (!rows) {
					rows = _selector_row_indexes(settings, opts);
				}

				if (selInt !== null && $.inArray(selInt, rows) !== -1) {
					// Selector - integer
					return [selInt];
				}
				else if (sel === null || sel === undefined || sel === '') {
					// Selector - none
					return rows;
				}

				// Selector - function
				if (typeof sel === 'function') {
					return $.map(rows, function (idx) {
						var row = aoData[idx];
						return sel(idx, row._aData, row.nTr) ? idx : null;
					});
				}

				// Selector - node
				if (sel.nodeName) {
					var rowIdx = sel._DT_RowIndex;  // Property added by DT for fast lookup
					var cellIdx = sel._DT_CellIndex;

					if (rowIdx !== undefined) {
						// Make sure that the row is actually still present in the table
						return aoData[rowIdx] && aoData[rowIdx].nTr === sel ?
							[rowIdx] :
							[];
					}
					else if (cellIdx) {
						return aoData[cellIdx.row] && aoData[cellIdx.row].nTr === sel.parentNode ?
							[cellIdx.row] :
							[];
					}
					else {
						var host = $(sel).closest('*[data-dt-row]');
						return host.length ?
							[host.data('dt-row')] :
							[];
					}
				}

				// ID selector. Want to always be able to select rows by id, regardless
				// of if the tr element has been created or not, so can't rely upon
				// jQuery here - hence a custom implementation. This does not match
				// Sizzle's fast selector or HTML4 - in HTML5 the ID can be anything,
				// but to select it using a CSS selector engine (like Sizzle or
				// querySelect) it would need to need to be escaped for some characters.
				// DataTables simplifies this for row selectors since you can select
				// only a row. A # indicates an id any anything that follows is the id -
				// unescaped.
				if (typeof sel === 'string' && sel.charAt(0) === '#') {
					// get row index from id
					var rowObj = settings.aIds[sel.replace(/^#/, '')];
					if (rowObj !== undefined) {
						return [rowObj.idx];
					}

					// need to fall through to jQuery in case there is DOM id that
					// matches
				}

				// Get nodes in the order from the `rows` array with null values removed
				var nodes = _removeEmpty(
					_pluck_order(settings.aoData, rows, 'nTr')
				);

				// Selector - jQuery selector string, array of nodes or jQuery object/
				// As jQuery's .filter() allows jQuery objects to be passed in filter,
				// it also allows arrays, so this will cope with all three options
				return $(nodes)
					.filter(sel)
					.map(function () {
						return this._DT_RowIndex;
					})
					.toArray();
			};

			return _selector_run('row', selector, run, settings, opts);
		};


		_api_register('rows()', function (selector, opts) {
			// argument shifting
			if (selector === undefined) {
				selector = '';
			}
			else if ($.isPlainObject(selector)) {
				opts = selector;
				selector = '';
			}

			opts = _selector_opts(opts);

			var inst = this.iterator('table', function (settings) {
				return __row_selector(settings, selector, opts);
			}, 1);

			// Want argument shifting here and in __row_selector?
			inst.selector.rows = selector;
			inst.selector.opts = opts;

			return inst;
		});

		_api_register('rows().nodes()', function () {
			return this.iterator('row', function (settings, row) {
				return settings.aoData[row].nTr || undefined;
			}, 1);
		});

		_api_register('rows().data()', function () {
			return this.iterator(true, 'rows', function (settings, rows) {
				return _pluck_order(settings.aoData, rows, '_aData');
			}, 1);
		});

		_api_registerPlural('rows().cache()', 'row().cache()', function (type) {
			return this.iterator('row', function (settings, row) {
				var r = settings.aoData[row];
				return type === 'search' ? r._aFilterData : r._aSortData;
			}, 1);
		});

		_api_registerPlural('rows().invalidate()', 'row().invalidate()', function (src) {
			return this.iterator('row', function (settings, row) {
				_fnInvalidate(settings, row, src);
			});
		});

		_api_registerPlural('rows().indexes()', 'row().index()', function () {
			return this.iterator('row', function (settings, row) {
				return row;
			}, 1);
		});

		_api_registerPlural('rows().ids()', 'row().id()', function (hash) {
			var a = [];
			var context = this.context;

			// `iterator` will drop undefined values, but in this case we want them
			for (var i = 0, ien = context.length; i < ien; i++) {
				for (var j = 0, jen = this[i].length; j < jen; j++) {
					var id = context[i].rowIdFn(context[i].aoData[this[i][j]]._aData);
					a.push((hash === true ? '#' : '') + id);
				}
			}

			return new _Api(context, a);
		});

		_api_registerPlural('rows().remove()', 'row().remove()', function () {
			var that = this;

			this.iterator('row', function (settings, row, thatIdx) {
				var data = settings.aoData;
				var rowData = data[row];
				var i, ien, j, jen;
				var loopRow, loopCells;

				data.splice(row, 1);

				// Update the cached indexes
				for (i = 0, ien = data.length; i < ien; i++) {
					loopRow = data[i];
					loopCells = loopRow.anCells;

					// Rows
					if (loopRow.nTr !== null) {
						loopRow.nTr._DT_RowIndex = i;
					}

					// Cells
					if (loopCells !== null) {
						for (j = 0, jen = loopCells.length; j < jen; j++) {
							loopCells[j]._DT_CellIndex.row = i;
						}
					}
				}

				// Delete from the display arrays
				_fnDeleteIndex(settings.aiDisplayMaster, row);
				_fnDeleteIndex(settings.aiDisplay, row);
				_fnDeleteIndex(that[thatIdx], row, false); // maintain local indexes

				// For server-side processing tables - subtract the deleted row from the count
				if (settings._iRecordsDisplay > 0) {
					settings._iRecordsDisplay--;
				}

				// Check for an 'overflow' they case for displaying the table
				_fnLengthOverflow(settings);

				// Remove the row's ID reference if there is one
				var id = settings.rowIdFn(rowData._aData);
				if (id !== undefined) {
					delete settings.aIds[id];
				}
			});

			this.iterator('table', function (settings) {
				for (var i = 0, ien = settings.aoData.length; i < ien; i++) {
					settings.aoData[i].idx = i;
				}
			});

			return this;
		});


		_api_register('rows.add()', function (rows) {
			var newRows = this.iterator('table', function (settings) {
				var row, i, ien;
				var out = [];

				for (i = 0, ien = rows.length; i < ien; i++) {
					row = rows[i];

					if (row.nodeName && row.nodeName.toUpperCase() === 'TR') {
						out.push(_fnAddTr(settings, row)[0]);
					}
					else {
						out.push(_fnAddData(settings, row));
					}
				}

				return out;
			}, 1);

			// Return an Api.rows() extended instance, so rows().nodes() etc can be used
			var modRows = this.rows(-1);
			modRows.pop();
			$.merge(modRows, newRows);

			return modRows;
		});





		/**
		 *
		 */
		_api_register('row()', function (selector, opts) {
			return _selector_first(this.rows(selector, opts));
		});


		_api_register('row().data()', function (data) {
			var ctx = this.context;

			if (data === undefined) {
				// Get
				return ctx.length && this.length ?
					ctx[0].aoData[this[0]]._aData :
					undefined;
			}

			// Set
			var row = ctx[0].aoData[this[0]];
			row._aData = data;

			// If the DOM has an id, and the data source is an array
			if (Array.isArray(data) && row.nTr && row.nTr.id) {
				_fnSetObjectDataFn(ctx[0].rowId)(data, row.nTr.id);
			}

			// Automatically invalidate
			_fnInvalidate(ctx[0], this[0], 'data');

			return this;
		});


		_api_register('row().node()', function () {
			var ctx = this.context;

			return ctx.length && this.length ?
				ctx[0].aoData[this[0]].nTr || null :
				null;
		});


		_api_register('row.add()', function (row) {
			// Allow a jQuery object to be passed in - only a single row is added from
			// it though - the first element in the set
			if (row instanceof $ && row.length) {
				row = row[0];
			}

			var rows = this.iterator('table', function (settings) {
				if (row.nodeName && row.nodeName.toUpperCase() === 'TR') {
					return _fnAddTr(settings, row)[0];
				}
				return _fnAddData(settings, row);
			});

			// Return an Api.rows() extended instance, with the newly added row selected
			return this.row(rows[0]);
		});


		$(document).on('plugin-init.dt', function (e, context) {
			var api = new _Api(context);
			var namespace = 'on-plugin-init';
			var stateSaveParamsEvent = 'stateSaveParams.' + namespace;
			var destroyEvent = 'destroy. ' + namespace;

			api.on(stateSaveParamsEvent, function (e, settings, d) {
				// This could be more compact with the API, but it is a lot faster as a simple
				// internal loop
				var idFn = settings.rowIdFn;
				var data = settings.aoData;
				var ids = [];

				for (var i = 0; i < data.length; i++) {
					if (data[i]._detailsShow) {
						ids.push('#' + idFn(data[i]._aData));
					}
				}

				d.childRows = ids;
			});

			api.on(destroyEvent, function () {
				api.off(stateSaveParamsEvent + ' ' + destroyEvent);
			});

			var loaded = api.state.loaded();

			if (loaded && loaded.childRows) {
				api
					.rows($.map(loaded.childRows, function (id) {
						return id.replace(/:/g, '\\:')
					}))
					.every(function () {
						_fnCallbackFire(context, null, 'requestChild', [this])
					});
			}
		});

		var __details_add = function (ctx, row, data, klass) {
			// Convert to array of TR elements
			var rows = [];
			var addRow = function (r, k) {
				// Recursion to allow for arrays of jQuery objects
				if (Array.isArray(r) || r instanceof $) {
					for (var i = 0, ien = r.length; i < ien; i++) {
						addRow(r[i], k);
					}
					return;
				}

				// If we get a TR element, then just add it directly - up to the dev
				// to add the correct number of columns etc
				if (r.nodeName && r.nodeName.toLowerCase() === 'tr') {
					rows.push(r);
				}
				else {
					// Otherwise create a row with a wrapper
					var created = $('<tr><td></td></tr>').addClass(k);
					$('td', created)
						.addClass(k)
						.html(r)
					[0].colSpan = _fnVisbleColumns(ctx);

					rows.push(created[0]);
				}
			};

			addRow(data, klass);

			if (row._details) {
				row._details.detach();
			}

			row._details = $(rows);

			// If the children were already shown, that state should be retained
			if (row._detailsShow) {
				row._details.insertAfter(row.nTr);
			}
		};


		// Make state saving of child row details async to allow them to be batch processed
		var __details_state = DataTable.util.throttle(
			function (ctx) {
				_fnSaveState(ctx[0])
			},
			500
		);


		var __details_remove = function (api, idx) {
			var ctx = api.context;

			if (ctx.length) {
				var row = ctx[0].aoData[idx !== undefined ? idx : api[0]];

				if (row && row._details) {
					row._details.remove();

					row._detailsShow = undefined;
					row._details = undefined;
					$(row.nTr).removeClass('dt-hasChild');
					__details_state(ctx);
				}
			}
		};


		var __details_display = function (api, show) {
			var ctx = api.context;

			if (ctx.length && api.length) {
				var row = ctx[0].aoData[api[0]];

				if (row._details) {
					row._detailsShow = show;

					if (show) {
						row._details.insertAfter(row.nTr);
						$(row.nTr).addClass('dt-hasChild');
					}
					else {
						row._details.detach();
						$(row.nTr).removeClass('dt-hasChild');
					}

					_fnCallbackFire(ctx[0], null, 'childRow', [show, api.row(api[0])])

					__details_events(ctx[0]);
					__details_state(ctx);
				}
			}
		};


		var __details_events = function (settings) {
			var api = new _Api(settings);
			var namespace = '.dt.DT_details';
			var drawEvent = 'draw' + namespace;
			var colvisEvent = 'column-sizing' + namespace;
			var destroyEvent = 'destroy' + namespace;
			var data = settings.aoData;

			api.off(drawEvent + ' ' + colvisEvent + ' ' + destroyEvent);

			if (_pluck(data, '_details').length > 0) {
				// On each draw, insert the required elements into the document
				api.on(drawEvent, function (e, ctx) {
					if (settings !== ctx) {
						return;
					}

					api.rows({ page: 'current' }).eq(0).each(function (idx) {
						// Internal data grab
						var row = data[idx];

						if (row._detailsShow) {
							row._details.insertAfter(row.nTr);
						}
					});
				});

				// Column visibility change - update the colspan
				api.on(colvisEvent, function (e, ctx, idx, vis) {
					if (settings !== ctx) {
						return;
					}

					// Update the colspan for the details rows (note, only if it already has
					// a colspan)
					var row, visible = _fnVisbleColumns(ctx);

					for (var i = 0, ien = data.length; i < ien; i++) {
						row = data[i];

						if (row._details) {
							row._details.children('td[colspan]').attr('colspan', visible);
						}
					}
				});

				// Table destroyed - nuke any child rows
				api.on(destroyEvent, function (e, ctx) {
					if (settings !== ctx) {
						return;
					}

					for (var i = 0, ien = data.length; i < ien; i++) {
						if (data[i]._details) {
							__details_remove(api, i);
						}
					}
				});
			}
		};

		// Strings for the method names to help minification
		var _emp = '';
		var _child_obj = _emp + 'row().child';
		var _child_mth = _child_obj + '()';

		// data can be:
		//  tr
		//  string
		//  jQuery or array of any of the above
		_api_register(_child_mth, function (data, klass) {
			var ctx = this.context;

			if (data === undefined) {
				// get
				return ctx.length && this.length ?
					ctx[0].aoData[this[0]]._details :
					undefined;
			}
			else if (data === true) {
				// show
				this.child.show();
			}
			else if (data === false) {
				// remove
				__details_remove(this);
			}
			else if (ctx.length && this.length) {
				// set
				__details_add(ctx[0], ctx[0].aoData[this[0]], data, klass);
			}

			return this;
		});


		_api_register([
			_child_obj + '.show()',
			_child_mth + '.show()' // only when `child()` was called with parameters (without
		], function (show) {   // it returns an object and this method is not executed)
			__details_display(this, true);
			return this;
		});


		_api_register([
			_child_obj + '.hide()',
			_child_mth + '.hide()' // only when `child()` was called with parameters (without
		], function () {         // it returns an object and this method is not executed)
			__details_display(this, false);
			return this;
		});


		_api_register([
			_child_obj + '.remove()',
			_child_mth + '.remove()' // only when `child()` was called with parameters (without
		], function () {           // it returns an object and this method is not executed)
			__details_remove(this);
			return this;
		});


		_api_register(_child_obj + '.isShown()', function () {
			var ctx = this.context;

			if (ctx.length && this.length) {
				// _detailsShown as false or undefined will fall through to return false
				return ctx[0].aoData[this[0]]._detailsShow || false;
			}
			return false;
		});



		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Columns
		 *
		 * {integer}           - column index (>=0 count from left, <0 count from right)
		 * "{integer}:visIdx"  - visible column index (i.e. translate to column index)  (>=0 count from left, <0 count from right)
		 * "{integer}:visible" - alias for {integer}:visIdx  (>=0 count from left, <0 count from right)
		 * "{string}:name"     - column name
		 * "{string}"          - jQuery selector on column header nodes
		 *
		 */

		// can be an array of these items, comma separated list, or an array of comma
		// separated lists

		var __re_column_selector = /^([^:]+):(name|visIdx|visible)$/;


		// r1 and r2 are redundant - but it means that the parameters match for the
		// iterator callback in columns().data()
		var __columnData = function (settings, column, r1, r2, rows) {
			var a = [];
			for (var row = 0, ien = rows.length; row < ien; row++) {
				a.push(_fnGetCellData(settings, rows[row], column));
			}
			return a;
		};


		var __column_selector = function (settings, selector, opts) {
			var
				columns = settings.aoColumns,
				names = _pluck(columns, 'sName'),
				nodes = _pluck(columns, 'nTh');

			var run = function (s) {
				var selInt = _intVal(s);

				// Selector - all
				if (s === '') {
					return _range(columns.length);
				}

				// Selector - index
				if (selInt !== null) {
					return [selInt >= 0 ?
						selInt : // Count from left
						columns.length + selInt // Count from right (+ because its a negative value)
					];
				}

				// Selector = function
				if (typeof s === 'function') {
					var rows = _selector_row_indexes(settings, opts);

					return $.map(columns, function (col, idx) {
						return s(
							idx,
							__columnData(settings, idx, 0, 0, rows),
							nodes[idx]
						) ? idx : null;
					});
				}

				// jQuery or string selector
				var match = typeof s === 'string' ?
					s.match(__re_column_selector) :
					'';

				if (match) {
					switch (match[2]) {
						case 'visIdx':
						case 'visible':
							var idx = parseInt(match[1], 10);
							// Visible index given, convert to column index
							if (idx < 0) {
								// Counting from the right
								var visColumns = $.map(columns, function (col, i) {
									return col.bVisible ? i : null;
								});
								return [visColumns[visColumns.length + idx]];
							}
							// Counting from the left
							return [_fnVisibleToColumnIndex(settings, idx)];

						case 'name':
							// match by name. `names` is column index complete and in order
							return $.map(names, function (name, i) {
								return name === match[1] ? i : null;
							});

						default:
							return [];
					}
				}

				// Cell in the table body
				if (s.nodeName && s._DT_CellIndex) {
					return [s._DT_CellIndex.column];
				}

				// jQuery selector on the TH elements for the columns
				var jqResult = $(nodes)
					.filter(s)
					.map(function () {
						return $.inArray(this, nodes); // `nodes` is column index complete and in order
					})
					.toArray();

				if (jqResult.length || !s.nodeName) {
					return jqResult;
				}

				// Otherwise a node which might have a `dt-column` data attribute, or be
				// a child or such an element
				var host = $(s).closest('*[data-dt-column]');
				return host.length ?
					[host.data('dt-column')] :
					[];
			};

			return _selector_run('column', selector, run, settings, opts);
		};


		var __setColumnVis = function (settings, column, vis) {
			var
				cols = settings.aoColumns,
				col = cols[column],
				data = settings.aoData,
				row, cells, i, ien, tr;

			// Get
			if (vis === undefined) {
				return col.bVisible;
			}

			// Set
			// No change
			if (col.bVisible === vis) {
				return;
			}

			if (vis) {
				// Insert column
				// Need to decide if we should use appendChild or insertBefore
				var insertBefore = $.inArray(true, _pluck(cols, 'bVisible'), column + 1);

				for (i = 0, ien = data.length; i < ien; i++) {
					tr = data[i].nTr;
					cells = data[i].anCells;

					if (tr) {
						// insertBefore can act like appendChild if 2nd arg is null
						tr.insertBefore(cells[column], cells[insertBefore] || null);
					}
				}
			}
			else {
				// Remove column
				$(_pluck(settings.aoData, 'anCells', column)).detach();
			}

			// Common actions
			col.bVisible = vis;
		};


		_api_register('columns()', function (selector, opts) {
			// argument shifting
			if (selector === undefined) {
				selector = '';
			}
			else if ($.isPlainObject(selector)) {
				opts = selector;
				selector = '';
			}

			opts = _selector_opts(opts);

			var inst = this.iterator('table', function (settings) {
				return __column_selector(settings, selector, opts);
			}, 1);

			// Want argument shifting here and in _row_selector?
			inst.selector.cols = selector;
			inst.selector.opts = opts;

			return inst;
		});

		_api_registerPlural('columns().header()', 'column().header()', function (selector, opts) {
			return this.iterator('column', function (settings, column) {
				return settings.aoColumns[column].nTh;
			}, 1);
		});

		_api_registerPlural('columns().footer()', 'column().footer()', function (selector, opts) {
			return this.iterator('column', function (settings, column) {
				return settings.aoColumns[column].nTf;
			}, 1);
		});

		_api_registerPlural('columns().data()', 'column().data()', function () {
			return this.iterator('column-rows', __columnData, 1);
		});

		_api_registerPlural('columns().dataSrc()', 'column().dataSrc()', function () {
			return this.iterator('column', function (settings, column) {
				return settings.aoColumns[column].mData;
			}, 1);
		});

		_api_registerPlural('columns().cache()', 'column().cache()', function (type) {
			return this.iterator('column-rows', function (settings, column, i, j, rows) {
				return _pluck_order(settings.aoData, rows,
					type === 'search' ? '_aFilterData' : '_aSortData', column
				);
			}, 1);
		});

		_api_registerPlural('columns().nodes()', 'column().nodes()', function () {
			return this.iterator('column-rows', function (settings, column, i, j, rows) {
				return _pluck_order(settings.aoData, rows, 'anCells', column);
			}, 1);
		});

		_api_registerPlural('columns().visible()', 'column().visible()', function (vis, calc) {
			var that = this;
			var ret = this.iterator('column', function (settings, column) {
				if (vis === undefined) {
					return settings.aoColumns[column].bVisible;
				} // else
				__setColumnVis(settings, column, vis);
			});

			// Group the column visibility changes
			if (vis !== undefined) {
				this.iterator('table', function (settings) {
					// Redraw the header after changes
					_fnDrawHead(settings, settings.aoHeader);
					_fnDrawHead(settings, settings.aoFooter);

					// Update colspan for no records display. Child rows and extensions will use their own
					// listeners to do this - only need to update the empty table item here
					if (!settings.aiDisplay.length) {
						$(settings.nTBody).find('td[colspan]').attr('colspan', _fnVisbleColumns(settings));
					}

					_fnSaveState(settings);

					// Second loop once the first is done for events
					that.iterator('column', function (settings, column) {
						_fnCallbackFire(settings, null, 'column-visibility', [settings, column, vis, calc]);
					});

					if (calc === undefined || calc) {
						that.columns.adjust();
					}
				});
			}

			return ret;
		});

		_api_registerPlural('columns().indexes()', 'column().index()', function (type) {
			return this.iterator('column', function (settings, column) {
				return type === 'visible' ?
					_fnColumnIndexToVisible(settings, column) :
					column;
			}, 1);
		});

		_api_register('columns.adjust()', function () {
			return this.iterator('table', function (settings) {
				_fnAdjustColumnSizing(settings);
			}, 1);
		});

		_api_register('column.index()', function (type, idx) {
			if (this.context.length !== 0) {
				var ctx = this.context[0];

				if (type === 'fromVisible' || type === 'toData') {
					return _fnVisibleToColumnIndex(ctx, idx);
				}
				else if (type === 'fromData' || type === 'toVisible') {
					return _fnColumnIndexToVisible(ctx, idx);
				}
			}
		});

		_api_register('column()', function (selector, opts) {
			return _selector_first(this.columns(selector, opts));
		});

		var __cell_selector = function (settings, selector, opts) {
			var data = settings.aoData;
			var rows = _selector_row_indexes(settings, opts);
			var cells = _removeEmpty(_pluck_order(data, rows, 'anCells'));
			var allCells = $(_flatten([], cells));
			var row;
			var columns = settings.aoColumns.length;
			var a, i, ien, j, o, host;

			var run = function (s) {
				var fnSelector = typeof s === 'function';

				if (s === null || s === undefined || fnSelector) {
					// All cells and function selectors
					a = [];

					for (i = 0, ien = rows.length; i < ien; i++) {
						row = rows[i];

						for (j = 0; j < columns; j++) {
							o = {
								row: row,
								column: j
							};

							if (fnSelector) {
								// Selector - function
								host = data[row];

								if (s(o, _fnGetCellData(settings, row, j), host.anCells ? host.anCells[j] : null)) {
									a.push(o);
								}
							}
							else {
								// Selector - all
								a.push(o);
							}
						}
					}

					return a;
				}

				// Selector - index
				if ($.isPlainObject(s)) {
					// Valid cell index and its in the array of selectable rows
					return s.column !== undefined && s.row !== undefined && $.inArray(s.row, rows) !== -1 ?
						[s] :
						[];
				}

				// Selector - jQuery filtered cells
				var jqResult = allCells
					.filter(s)
					.map(function (i, el) {
						return { // use a new object, in case someone changes the values
							row: el._DT_CellIndex.row,
							column: el._DT_CellIndex.column
						};
					})
					.toArray();

				if (jqResult.length || !s.nodeName) {
					return jqResult;
				}

				// Otherwise the selector is a node, and there is one last option - the
				// element might be a child of an element which has dt-row and dt-column
				// data attributes
				host = $(s).closest('*[data-dt-row]');
				return host.length ?
					[{
						row: host.data('dt-row'),
						column: host.data('dt-column')
					}] :
					[];
			};

			return _selector_run('cell', selector, run, settings, opts);
		};




		_api_register('cells()', function (rowSelector, columnSelector, opts) {
			// Argument shifting
			if ($.isPlainObject(rowSelector)) {
				// Indexes
				if (rowSelector.row === undefined) {
					// Selector options in first parameter
					opts = rowSelector;
					rowSelector = null;
				}
				else {
					// Cell index objects in first parameter
					opts = columnSelector;
					columnSelector = null;
				}
			}
			if ($.isPlainObject(columnSelector)) {
				opts = columnSelector;
				columnSelector = null;
			}

			// Cell selector
			if (columnSelector === null || columnSelector === undefined) {
				return this.iterator('table', function (settings) {
					return __cell_selector(settings, rowSelector, _selector_opts(opts));
				});
			}

			// The default built in options need to apply to row and columns
			var internalOpts = opts ? {
				page: opts.page,
				order: opts.order,
				search: opts.search
			} : {};

			// Row + column selector
			var columns = this.columns(columnSelector, internalOpts);
			var rows = this.rows(rowSelector, internalOpts);
			var i, ien, j, jen;

			var cellsNoOpts = this.iterator('table', function (settings, idx) {
				var a = [];

				for (i = 0, ien = rows[idx].length; i < ien; i++) {
					for (j = 0, jen = columns[idx].length; j < jen; j++) {
						a.push({
							row: rows[idx][i],
							column: columns[idx][j]
						});
					}
				}

				return a;
			}, 1);

			// There is currently only one extension which uses a cell selector extension
			// It is a _major_ performance drag to run this if it isn't needed, so this is
			// an extension specific check at the moment
			var cells = opts && opts.selected ?
				this.cells(cellsNoOpts, opts) :
				cellsNoOpts;

			$.extend(cells.selector, {
				cols: columnSelector,
				rows: rowSelector,
				opts: opts
			});

			return cells;
		});


		_api_registerPlural('cells().nodes()', 'cell().node()', function () {
			return this.iterator('cell', function (settings, row, column) {
				var data = settings.aoData[row];

				return data && data.anCells ?
					data.anCells[column] :
					undefined;
			}, 1);
		});


		_api_register('cells().data()', function () {
			return this.iterator('cell', function (settings, row, column) {
				return _fnGetCellData(settings, row, column);
			}, 1);
		});


		_api_registerPlural('cells().cache()', 'cell().cache()', function (type) {
			type = type === 'search' ? '_aFilterData' : '_aSortData';

			return this.iterator('cell', function (settings, row, column) {
				return settings.aoData[row][type][column];
			}, 1);
		});


		_api_registerPlural('cells().render()', 'cell().render()', function (type) {
			return this.iterator('cell', function (settings, row, column) {
				return _fnGetCellData(settings, row, column, type);
			}, 1);
		});


		_api_registerPlural('cells().indexes()', 'cell().index()', function () {
			return this.iterator('cell', function (settings, row, column) {
				return {
					row: row,
					column: column,
					columnVisible: _fnColumnIndexToVisible(settings, column)
				};
			}, 1);
		});


		_api_registerPlural('cells().invalidate()', 'cell().invalidate()', function (src) {
			return this.iterator('cell', function (settings, row, column) {
				_fnInvalidate(settings, row, src, column);
			});
		});



		_api_register('cell()', function (rowSelector, columnSelector, opts) {
			return _selector_first(this.cells(rowSelector, columnSelector, opts));
		});


		_api_register('cell().data()', function (data) {
			var ctx = this.context;
			var cell = this[0];

			if (data === undefined) {
				// Get
				return ctx.length && cell.length ?
					_fnGetCellData(ctx[0], cell[0].row, cell[0].column) :
					undefined;
			}

			// Set
			_fnSetCellData(ctx[0], cell[0].row, cell[0].column, data);
			_fnInvalidate(ctx[0], cell[0].row, 'data', cell[0].column);

			return this;
		});



		/**
		 * Get current ordering (sorting) that has been applied to the table.
		 *
		 * @returns {array} 2D array containing the sorting information for the first
		 *   table in the current context. Each element in the parent array represents
		 *   a column being sorted upon (i.e. multi-sorting with two columns would have
		 *   2 inner arrays). The inner arrays may have 2 or 3 elements. The first is
		 *   the column index that the sorting condition applies to, the second is the
		 *   direction of the sort (`desc` or `asc`) and, optionally, the third is the
		 *   index of the sorting order from the `column.sorting` initialisation array.
		 *//**
		* Set the ordering for the table.
		*
		* @param {integer} order Column index to sort upon.
		* @param {string} direction Direction of the sort to be applied (`asc` or `desc`)
		* @returns {DataTables.Api} this
		*//**
		* Set the ordering for the table.
		*
		* @param {array} order 1D array of sorting information to be applied.
		* @param {array} [...] Optional additional sorting conditions
		* @returns {DataTables.Api} this
		*//**
		* Set the ordering for the table.
		*
		* @param {array} order 2D array of sorting information to be applied.
		* @returns {DataTables.Api} this
		*/
		_api_register('order()', function (order, dir) {
			var ctx = this.context;

			if (order === undefined) {
				// get
				return ctx.length !== 0 ?
					ctx[0].aaSorting :
					undefined;
			}

			// set
			if (typeof order === 'number') {
				// Simple column / direction passed in
				order = [[order, dir]];
			}
			else if (order.length && !Array.isArray(order[0])) {
				// Arguments passed in (list of 1D arrays)
				order = Array.prototype.slice.call(arguments);
			}
			// otherwise a 2D array was passed in

			return this.iterator('table', function (settings) {
				settings.aaSorting = order.slice();
			});
		});


		/**
		 * Attach a sort listener to an element for a given column
		 *
		 * @param {node|jQuery|string} node Identifier for the element(s) to attach the
		 *   listener to. This can take the form of a single DOM node, a jQuery
		 *   collection of nodes or a jQuery selector which will identify the node(s).
		 * @param {integer} column the column that a click on this node will sort on
		 * @param {function} [callback] callback function when sort is run
		 * @returns {DataTables.Api} this
		 */
		_api_register('order.listener()', function (node, column, callback) {
			return this.iterator('table', function (settings) {
				_fnSortAttachListener(settings, node, column, callback);
			});
		});


		_api_register('order.fixed()', function (set) {
			if (!set) {
				var ctx = this.context;
				var fixed = ctx.length ?
					ctx[0].aaSortingFixed :
					undefined;

				return Array.isArray(fixed) ?
					{ pre: fixed } :
					fixed;
			}

			return this.iterator('table', function (settings) {
				settings.aaSortingFixed = $.extend(true, {}, set);
			});
		});


		// Order by the selected column(s)
		_api_register([
			'columns().order()',
			'column().order()'
		], function (dir) {
			var that = this;

			return this.iterator('table', function (settings, i) {
				var sort = [];

				$.each(that[i], function (j, col) {
					sort.push([col, dir]);
				});

				settings.aaSorting = sort;
			});
		});



		_api_register('search()', function (input, regex, smart, caseInsen) {
			var ctx = this.context;

			if (input === undefined) {
				// get
				return ctx.length !== 0 ?
					ctx[0].oPreviousSearch.sSearch :
					undefined;
			}

			// set
			return this.iterator('table', function (settings) {
				if (!settings.oFeatures.bFilter) {
					return;
				}

				_fnFilterComplete(settings, $.extend({}, settings.oPreviousSearch, {
					"sSearch": input + "",
					"bRegex": regex === null ? false : regex,
					"bSmart": smart === null ? true : smart,
					"bCaseInsensitive": caseInsen === null ? true : caseInsen
				}), 1);
			});
		});


		_api_registerPlural(
			'columns().search()',
			'column().search()',
			function (input, regex, smart, caseInsen) {
				return this.iterator('column', function (settings, column) {
					var preSearch = settings.aoPreSearchCols;

					if (input === undefined) {
						// get
						return preSearch[column].sSearch;
					}

					// set
					if (!settings.oFeatures.bFilter) {
						return;
					}

					$.extend(preSearch[column], {
						"sSearch": input + "",
						"bRegex": regex === null ? false : regex,
						"bSmart": smart === null ? true : smart,
						"bCaseInsensitive": caseInsen === null ? true : caseInsen
					});

					_fnFilterComplete(settings, settings.oPreviousSearch, 1);
				});
			}
		);

		/*
		 * State API methods
		 */

		_api_register('state()', function () {
			return this.context.length ?
				this.context[0].oSavedState :
				null;
		});


		_api_register('state.clear()', function () {
			return this.iterator('table', function (settings) {
				// Save an empty object
				settings.fnStateSaveCallback.call(settings.oInstance, settings, {});
			});
		});


		_api_register('state.loaded()', function () {
			return this.context.length ?
				this.context[0].oLoadedState :
				null;
		});


		_api_register('state.save()', function () {
			return this.iterator('table', function (settings) {
				_fnSaveState(settings);
			});
		});



		/**
		 * Provide a common method for plug-ins to check the version of DataTables being
		 * used, in order to ensure compatibility.
		 *
		 *  @param {string} version Version string to check for, in the format "X.Y.Z".
		 *    Note that the formats "X" and "X.Y" are also acceptable.
		 *  @returns {boolean} true if this version of DataTables is greater or equal to
		 *    the required version, or false if this version of DataTales is not
		 *    suitable
		 *  @static
		 *  @dtopt API-Static
		 *
		 *  @example
		 *    alert( $.fn.dataTable.versionCheck( '1.9.0' ) );
		 */
		DataTable.versionCheck = DataTable.fnVersionCheck = function (version) {
			var aThis = DataTable.version.split('.');
			var aThat = version.split('.');
			var iThis, iThat;

			for (var i = 0, iLen = aThat.length; i < iLen; i++) {
				iThis = parseInt(aThis[i], 10) || 0;
				iThat = parseInt(aThat[i], 10) || 0;

				// Parts are the same, keep comparing
				if (iThis === iThat) {
					continue;
				}

				// Parts are different, return immediately
				return iThis > iThat;
			}

			return true;
		};


		/**
		 * Check if a `<table>` node is a DataTable table already or not.
		 *
		 *  @param {node|jquery|string} table Table node, jQuery object or jQuery
		 *      selector for the table to test. Note that if more than more than one
		 *      table is passed on, only the first will be checked
		 *  @returns {boolean} true the table given is a DataTable, or false otherwise
		 *  @static
		 *  @dtopt API-Static
		 *
		 *  @example
		 *    if ( ! $.fn.DataTable.isDataTable( '#example' ) ) {
		 *      $('#example').dataTable();
		 *    }
		 */
		DataTable.isDataTable = DataTable.fnIsDataTable = function (table) {
			var t = $(table).get(0);
			var is = false;

			if (table instanceof DataTable.Api) {
				return true;
			}

			$.each(DataTable.settings, function (i, o) {
				var head = o.nScrollHead ? $('table', o.nScrollHead)[0] : null;
				var foot = o.nScrollFoot ? $('table', o.nScrollFoot)[0] : null;

				if (o.nTable === t || head === t || foot === t) {
					is = true;
				}
			});

			return is;
		};


		/**
		 * Get all DataTable tables that have been initialised - optionally you can
		 * select to get only currently visible tables.
		 *
		 *  @param {boolean} [visible=false] Flag to indicate if you want all (default)
		 *    or visible tables only.
		 *  @returns {array} Array of `table` nodes (not DataTable instances) which are
		 *    DataTables
		 *  @static
		 *  @dtopt API-Static
		 *
		 *  @example
		 *    $.each( $.fn.dataTable.tables(true), function () {
		 *      $(table).DataTable().columns.adjust();
		 *    } );
		 */
		DataTable.tables = DataTable.fnTables = function (visible) {
			var api = false;

			if ($.isPlainObject(visible)) {
				api = visible.api;
				visible = visible.visible;
			}

			var a = $.map(DataTable.settings, function (o) {
				if (!visible || (visible && $(o.nTable).is(':visible'))) {
					return o.nTable;
				}
			});

			return api ?
				new _Api(a) :
				a;
		};


		/**
		 * Convert from camel case parameters to Hungarian notation. This is made public
		 * for the extensions to provide the same ability as DataTables core to accept
		 * either the 1.9 style Hungarian notation, or the 1.10+ style camelCase
		 * parameters.
		 *
		 *  @param {object} src The model object which holds all parameters that can be
		 *    mapped.
		 *  @param {object} user The object to convert from camel case to Hungarian.
		 *  @param {boolean} force When set to `true`, properties which already have a
		 *    Hungarian value in the `user` object will be overwritten. Otherwise they
		 *    won't be.
		 */
		DataTable.camelToHungarian = _fnCamelToHungarian;



		/**
		 *
		 */
		_api_register('$()', function (selector, opts) {
			var
				rows = this.rows(opts).nodes(), // Get all rows
				jqRows = $(rows);

			return $([].concat(
				jqRows.filter(selector).toArray(),
				jqRows.find(selector).toArray()
			));
		});


		// jQuery functions to operate on the tables
		$.each(['on', 'one', 'off'], function (i, key) {
			_api_register(key + '()', function ( /* event, handler */) {
				var args = Array.prototype.slice.call(arguments);

				// Add the `dt` namespace automatically if it isn't already present
				args[0] = $.map(args[0].split(/\s/), function (e) {
					return !e.match(/\.dt\b/) ?
						e + '.dt' :
						e;
				}).join(' ');

				var inst = $(this.tables().nodes());
				inst[key].apply(inst, args);
				return this;
			});
		});


		_api_register('clear()', function () {
			return this.iterator('table', function (settings) {
				_fnClearTable(settings);
			});
		});


		_api_register('settings()', function () {
			return new _Api(this.context, this.context);
		});


		_api_register('init()', function () {
			var ctx = this.context;
			return ctx.length ? ctx[0].oInit : null;
		});


		_api_register('data()', function () {
			return this.iterator('table', function (settings) {
				return _pluck(settings.aoData, '_aData');
			}).flatten();
		});


		_api_register('destroy()', function (remove) {
			remove = remove || false;

			return this.iterator('table', function (settings) {
				var classes = settings.oClasses;
				var table = settings.nTable;
				var tbody = settings.nTBody;
				var thead = settings.nTHead;
				var tfoot = settings.nTFoot;
				var jqTable = $(table);
				var jqTbody = $(tbody);
				var jqWrapper = $(settings.nTableWrapper);
				var rows = $.map(settings.aoData, function (r) { return r.nTr; });
				var i, ien;

				// Flag to note that the table is currently being destroyed - no action
				// should be taken
				settings.bDestroying = true;

				// Fire off the destroy callbacks for plug-ins etc
				_fnCallbackFire(settings, "aoDestroyCallback", "destroy", [settings]);

				// If not being removed from the document, make all columns visible
				if (!remove) {
					new _Api(settings).columns().visible(true);
				}

				// Blitz all `DT` namespaced events (these are internal events, the
				// lowercase, `dt` events are user subscribed and they are responsible
				// for removing them
				jqWrapper.off('.DT').find(':not(tbody *)').off('.DT');
				$(window).off('.DT-' + settings.sInstance);

				// When scrolling we had to break the table up - restore it
				if (table != thead.parentNode) {
					jqTable.children('thead').detach();
					jqTable.append(thead);
				}

				if (tfoot && table != tfoot.parentNode) {
					jqTable.children('tfoot').detach();
					jqTable.append(tfoot);
				}

				settings.aaSorting = [];
				settings.aaSortingFixed = [];
				_fnSortingClasses(settings);

				$(rows).removeClass(settings.asStripeClasses.join(' '));

				$('th, td', thead).removeClass(classes.sSortable + ' ' +
					classes.sSortableAsc + ' ' + classes.sSortableDesc + ' ' + classes.sSortableNone
				);

				// Add the TR elements back into the table in their original order
				jqTbody.children().detach();
				jqTbody.append(rows);

				var orig = settings.nTableWrapper.parentNode;

				// Remove the DataTables generated nodes, events and classes
				var removedMethod = remove ? 'remove' : 'detach';
				jqTable[removedMethod]();
				jqWrapper[removedMethod]();

				// If we need to reattach the table to the document
				if (!remove && orig) {
					// insertBefore acts like appendChild if !arg[1]
					orig.insertBefore(table, settings.nTableReinsertBefore);

					// Restore the width of the original table - was read from the style property,
					// so we can restore directly to that
					jqTable
						.css('width', settings.sDestroyWidth)
						.removeClass(classes.sTable);

					// If the were originally stripe classes - then we add them back here.
					// Note this is not fool proof (for example if not all rows had stripe
					// classes - but it's a good effort without getting carried away
					ien = settings.asDestroyStripes.length;

					if (ien) {
						jqTbody.children().each(function (i) {
							$(this).addClass(settings.asDestroyStripes[i % ien]);
						});
					}
				}

				/* Remove the settings object from the settings array */
				var idx = $.inArray(settings, DataTable.settings);
				if (idx !== -1) {
					DataTable.settings.splice(idx, 1);
				}
			});
		});


		// Add the `every()` method for rows, columns and cells in a compact form
		$.each(['column', 'row', 'cell'], function (i, type) {
			_api_register(type + 's().every()', function (fn) {
				var opts = this.selector.opts;
				var api = this;

				return this.iterator(type, function (settings, arg1, arg2, arg3, arg4) {
					// Rows and columns:
					//  arg1 - index
					//  arg2 - table counter
					//  arg3 - loop counter
					//  arg4 - undefined
					// Cells:
					//  arg1 - row index
					//  arg2 - column index
					//  arg3 - table counter
					//  arg4 - loop counter
					fn.call(
						api[type](
							arg1,
							type === 'cell' ? arg2 : opts,
							type === 'cell' ? opts : undefined
						),
						arg1, arg2, arg3, arg4
					);
				});
			});
		});


		// i18n method for extensions to be able to use the language object from the
		// DataTable
		_api_register('i18n()', function (token, def, plural) {
			var ctx = this.context[0];
			var resolved = _fnGetObjectDataFn(token)(ctx.oLanguage);

			if (resolved === undefined) {
				resolved = def;
			}

			if (plural !== undefined && $.isPlainObject(resolved)) {
				resolved = resolved[plural] !== undefined ?
					resolved[plural] :
					resolved._;
			}

			return resolved.replace('%d', plural); // nb: plural might be undefined,
		});
		/**
		 * Version string for plug-ins to check compatibility. Allowed format is
		 * `a.b.c-d` where: a:int, b:int, c:int, d:string(dev|beta|alpha). `d` is used
		 * only for non-release builds. See http://semver.org/ for more information.
		 *  @member
		 *  @type string
		 *  @default Version number
		 */
		DataTable.version = "1.13.2";

		/**
		 * Private data store, containing all of the settings objects that are
		 * created for the tables on a given page.
		 *
		 * Note that the `DataTable.settings` object is aliased to
		 * `jQuery.fn.dataTableExt` through which it may be accessed and
		 * manipulated, or `jQuery.fn.dataTable.settings`.
		 *  @member
		 *  @type array
		 *  @default []
		 *  @private
		 */
		DataTable.settings = [];

		/**
		 * Object models container, for the various models that DataTables has
		 * available to it. These models define the objects that are used to hold
		 * the active state and configuration of the table.
		 *  @namespace
		 */
		DataTable.models = {};



		/**
		 * Template object for the way in which DataTables holds information about
		 * search information for the global filter and individual column filters.
		 *  @namespace
		 */
		DataTable.models.oSearch = {
			/**
			 * Flag to indicate if the filtering should be case insensitive or not
			 *  @type boolean
			 *  @default true
			 */
			"bCaseInsensitive": true,

			/**
			 * Applied search term
			 *  @type string
			 *  @default <i>Empty string</i>
			 */
			"sSearch": "",

			/**
			 * Flag to indicate if the search term should be interpreted as a
			 * regular expression (true) or not (false) and therefore and special
			 * regex characters escaped.
			 *  @type boolean
			 *  @default false
			 */
			"bRegex": false,

			/**
			 * Flag to indicate if DataTables is to use its smart filtering or not.
			 *  @type boolean
			 *  @default true
			 */
			"bSmart": true,

			/**
			 * Flag to indicate if DataTables should only trigger a search when
			 * the return key is pressed.
			 *  @type boolean
			 *  @default false
			 */
			"return": false
		};




		/**
		 * Template object for the way in which DataTables holds information about
		 * each individual row. This is the object format used for the settings
		 * aoData array.
		 *  @namespace
		 */
		DataTable.models.oRow = {
			/**
			 * TR element for the row
			 *  @type node
			 *  @default null
			 */
			"nTr": null,

			/**
			 * Array of TD elements for each row. This is null until the row has been
			 * created.
			 *  @type array nodes
			 *  @default []
			 */
			"anCells": null,

			/**
			 * Data object from the original data source for the row. This is either
			 * an array if using the traditional form of DataTables, or an object if
			 * using mData options. The exact type will depend on the passed in
			 * data from the data source, or will be an array if using DOM a data
			 * source.
			 *  @type array|object
			 *  @default []
			 */
			"_aData": [],

			/**
			 * Sorting data cache - this array is ostensibly the same length as the
			 * number of columns (although each index is generated only as it is
			 * needed), and holds the data that is used for sorting each column in the
			 * row. We do this cache generation at the start of the sort in order that
			 * the formatting of the sort data need be done only once for each cell
			 * per sort. This array should not be read from or written to by anything
			 * other than the master sorting methods.
			 *  @type array
			 *  @default null
			 *  @private
			 */
			"_aSortData": null,

			/**
			 * Per cell filtering data cache. As per the sort data cache, used to
			 * increase the performance of the filtering in DataTables
			 *  @type array
			 *  @default null
			 *  @private
			 */
			"_aFilterData": null,

			/**
			 * Filtering data cache. This is the same as the cell filtering cache, but
			 * in this case a string rather than an array. This is easily computed with
			 * a join on `_aFilterData`, but is provided as a cache so the join isn't
			 * needed on every search (memory traded for performance)
			 *  @type array
			 *  @default null
			 *  @private
			 */
			"_sFilterRow": null,

			/**
			 * Cache of the class name that DataTables has applied to the row, so we
			 * can quickly look at this variable rather than needing to do a DOM check
			 * on className for the nTr property.
			 *  @type string
			 *  @default <i>Empty string</i>
			 *  @private
			 */
			"_sRowStripe": "",

			/**
			 * Denote if the original data source was from the DOM, or the data source
			 * object. This is used for invalidating data, so DataTables can
			 * automatically read data from the original source, unless uninstructed
			 * otherwise.
			 *  @type string
			 *  @default null
			 *  @private
			 */
			"src": null,

			/**
			 * Index in the aoData array. This saves an indexOf lookup when we have the
			 * object, but want to know the index
			 *  @type integer
			 *  @default -1
			 *  @private
			 */
			"idx": -1
		};


		/**
		 * Template object for the column information object in DataTables. This object
		 * is held in the settings aoColumns array and contains all the information that
		 * DataTables needs about each individual column.
		 *
		 * Note that this object is related to {@link DataTable.defaults.column}
		 * but this one is the internal data store for DataTables's cache of columns.
		 * It should NOT be manipulated outside of DataTables. Any configuration should
		 * be done through the initialisation options.
		 *  @namespace
		 */
		DataTable.models.oColumn = {
			/**
			 * Column index. This could be worked out on-the-fly with $.inArray, but it
			 * is faster to just hold it as a variable
			 *  @type integer
			 *  @default null
			 */
			"idx": null,

			/**
			 * A list of the columns that sorting should occur on when this column
			 * is sorted. That this property is an array allows multi-column sorting
			 * to be defined for a column (for example first name / last name columns
			 * would benefit from this). The values are integers pointing to the
			 * columns to be sorted on (typically it will be a single integer pointing
			 * at itself, but that doesn't need to be the case).
			 *  @type array
			 */
			"aDataSort": null,

			/**
			 * Define the sorting directions that are applied to the column, in sequence
			 * as the column is repeatedly sorted upon - i.e. the first value is used
			 * as the sorting direction when the column if first sorted (clicked on).
			 * Sort it again (click again) and it will move on to the next index.
			 * Repeat until loop.
			 *  @type array
			 */
			"asSorting": null,

			/**
			 * Flag to indicate if the column is searchable, and thus should be included
			 * in the filtering or not.
			 *  @type boolean
			 */
			"bSearchable": null,

			/**
			 * Flag to indicate if the column is sortable or not.
			 *  @type boolean
			 */
			"bSortable": null,

			/**
			 * Flag to indicate if the column is currently visible in the table or not
			 *  @type boolean
			 */
			"bVisible": null,

			/**
			 * Store for manual type assignment using the `column.type` option. This
			 * is held in store so we can manipulate the column's `sType` property.
			 *  @type string
			 *  @default null
			 *  @private
			 */
			"_sManualType": null,

			/**
			 * Flag to indicate if HTML5 data attributes should be used as the data
			 * source for filtering or sorting. True is either are.
			 *  @type boolean
			 *  @default false
			 *  @private
			 */
			"_bAttrSrc": false,

			/**
			 * Developer definable function that is called whenever a cell is created (Ajax source,
			 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
			 * allowing you to modify the DOM element (add background colour for example) when the
			 * element is available.
			 *  @type function
			 *  @param {element} nTd The TD node that has been created
			 *  @param {*} sData The Data for the cell
			 *  @param {array|object} oData The data for the whole row
			 *  @param {int} iRow The row index for the aoData data store
			 *  @default null
			 */
			"fnCreatedCell": null,

			/**
			 * Function to get data from a cell in a column. You should <b>never</b>
			 * access data directly through _aData internally in DataTables - always use
			 * the method attached to this property. It allows mData to function as
			 * required. This function is automatically assigned by the column
			 * initialisation method
			 *  @type function
			 *  @param {array|object} oData The data array/object for the array
			 *    (i.e. aoData[]._aData)
			 *  @param {string} sSpecific The specific data type you want to get -
			 *    'display', 'type' 'filter' 'sort'
			 *  @returns {*} The data for the cell from the given row's data
			 *  @default null
			 */
			"fnGetData": null,

			/**
			 * Function to set data for a cell in the column. You should <b>never</b>
			 * set the data directly to _aData internally in DataTables - always use
			 * this method. It allows mData to function as required. This function
			 * is automatically assigned by the column initialisation method
			 *  @type function
			 *  @param {array|object} oData The data array/object for the array
			 *    (i.e. aoData[]._aData)
			 *  @param {*} sValue Value to set
			 *  @default null
			 */
			"fnSetData": null,

			/**
			 * Property to read the value for the cells in the column from the data
			 * source array / object. If null, then the default content is used, if a
			 * function is given then the return from the function is used.
			 *  @type function|int|string|null
			 *  @default null
			 */
			"mData": null,

			/**
			 * Partner property to mData which is used (only when defined) to get
			 * the data - i.e. it is basically the same as mData, but without the
			 * 'set' option, and also the data fed to it is the result from mData.
			 * This is the rendering method to match the data method of mData.
			 *  @type function|int|string|null
			 *  @default null
			 */
			"mRender": null,

			/**
			 * Unique header TH/TD element for this column - this is what the sorting
			 * listener is attached to (if sorting is enabled.)
			 *  @type node
			 *  @default null
			 */
			"nTh": null,

			/**
			 * Unique footer TH/TD element for this column (if there is one). Not used
			 * in DataTables as such, but can be used for plug-ins to reference the
			 * footer for each column.
			 *  @type node
			 *  @default null
			 */
			"nTf": null,

			/**
			 * The class to apply to all TD elements in the table's TBODY for the column
			 *  @type string
			 *  @default null
			 */
			"sClass": null,

			/**
			 * When DataTables calculates the column widths to assign to each column,
			 * it finds the longest string in each column and then constructs a
			 * temporary table and reads the widths from that. The problem with this
			 * is that "mmm" is much wider then "iiii", but the latter is a longer
			 * string - thus the calculation can go wrong (doing it properly and putting
			 * it into an DOM object and measuring that is horribly(!) slow). Thus as
			 * a "work around" we provide this option. It will append its value to the
			 * text that is found to be the longest string for the column - i.e. padding.
			 *  @type string
			 */
			"sContentPadding": null,

			/**
			 * Allows a default value to be given for a column's data, and will be used
			 * whenever a null data source is encountered (this can be because mData
			 * is set to null, or because the data source itself is null).
			 *  @type string
			 *  @default null
			 */
			"sDefaultContent": null,

			/**
			 * Name for the column, allowing reference to the column by name as well as
			 * by index (needs a lookup to work by name).
			 *  @type string
			 */
			"sName": null,

			/**
			 * Custom sorting data type - defines which of the available plug-ins in
			 * afnSortData the custom sorting will use - if any is defined.
			 *  @type string
			 *  @default std
			 */
			"sSortDataType": 'std',

			/**
			 * Class to be applied to the header element when sorting on this column
			 *  @type string
			 *  @default null
			 */
			"sSortingClass": null,

			/**
			 * Class to be applied to the header element when sorting on this column -
			 * when jQuery UI theming is used.
			 *  @type string
			 *  @default null
			 */
			"sSortingClassJUI": null,

			/**
			 * Title of the column - what is seen in the TH element (nTh).
			 *  @type string
			 */
			"sTitle": null,

			/**
			 * Column sorting and filtering type
			 *  @type string
			 *  @default null
			 */
			"sType": null,

			/**
			 * Width of the column
			 *  @type string
			 *  @default null
			 */
			"sWidth": null,

			/**
			 * Width of the column when it was first "encountered"
			 *  @type string
			 *  @default null
			 */
			"sWidthOrig": null
		};


		/*
		 * Developer note: The properties of the object below are given in Hungarian
		 * notation, that was used as the interface for DataTables prior to v1.10, however
		 * from v1.10 onwards the primary interface is camel case. In order to avoid
		 * breaking backwards compatibility utterly with this change, the Hungarian
		 * version is still, internally the primary interface, but is is not documented
		 * - hence the @name tags in each doc comment. This allows a Javascript function
		 * to create a map from Hungarian notation to camel case (going the other direction
		 * would require each property to be listed, which would add around 3K to the size
		 * of DataTables, while this method is about a 0.5K hit).
		 *
		 * Ultimately this does pave the way for Hungarian notation to be dropped
		 * completely, but that is a massive amount of work and will break current
		 * installs (therefore is on-hold until v2).
		 */

		/**
		 * Initialisation options that can be given to DataTables at initialisation
		 * time.
		 *  @namespace
		 */
		DataTable.defaults = {
			/**
			 * An array of data to use for the table, passed in at initialisation which
			 * will be used in preference to any data which is already in the DOM. This is
			 * particularly useful for constructing tables purely in Javascript, for
			 * example with a custom Ajax call.
			 *  @type array
			 *  @default null
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.data
			 *
			 *  @example
			 *    // Using a 2D array data source
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "data": [
			 *          ['Trident', 'Internet Explorer 4.0', 'Win 95+', 4, 'X'],
			 *          ['Trident', 'Internet Explorer 5.0', 'Win 95+', 5, 'C'],
			 *        ],
			 *        "columns": [
			 *          { "title": "Engine" },
			 *          { "title": "Browser" },
			 *          { "title": "Platform" },
			 *          { "title": "Version" },
			 *          { "title": "Grade" }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using an array of objects as a data source (`data`)
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "data": [
			 *          {
			 *            "engine":   "Trident",
			 *            "browser":  "Internet Explorer 4.0",
			 *            "platform": "Win 95+",
			 *            "version":  4,
			 *            "grade":    "X"
			 *          },
			 *          {
			 *            "engine":   "Trident",
			 *            "browser":  "Internet Explorer 5.0",
			 *            "platform": "Win 95+",
			 *            "version":  5,
			 *            "grade":    "C"
			 *          }
			 *        ],
			 *        "columns": [
			 *          { "title": "Engine",   "data": "engine" },
			 *          { "title": "Browser",  "data": "browser" },
			 *          { "title": "Platform", "data": "platform" },
			 *          { "title": "Version",  "data": "version" },
			 *          { "title": "Grade",    "data": "grade" }
			 *        ]
			 *      } );
			 *    } );
			 */
			"aaData": null,


			/**
			 * If ordering is enabled, then DataTables will perform a first pass sort on
			 * initialisation. You can define which column(s) the sort is performed
			 * upon, and the sorting direction, with this variable. The `sorting` array
			 * should contain an array for each column to be sorted initially containing
			 * the column's index and a direction string ('asc' or 'desc').
			 *  @type array
			 *  @default [[0,'asc']]
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.order
			 *
			 *  @example
			 *    // Sort by 3rd column first, and then 4th column
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "order": [[2,'asc'], [3,'desc']]
			 *      } );
			 *    } );
			 *
			 *    // No initial sorting
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "order": []
			 *      } );
			 *    } );
			 */
			"aaSorting": [[0, 'asc']],


			/**
			 * This parameter is basically identical to the `sorting` parameter, but
			 * cannot be overridden by user interaction with the table. What this means
			 * is that you could have a column (visible or hidden) which the sorting
			 * will always be forced on first - any sorting after that (from the user)
			 * will then be performed as required. This can be useful for grouping rows
			 * together.
			 *  @type array
			 *  @default null
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.orderFixed
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "orderFixed": [[0,'asc']]
			 *      } );
			 *    } )
			 */
			"aaSortingFixed": [],


			/**
			 * DataTables can be instructed to load data to display in the table from a
			 * Ajax source. This option defines how that Ajax call is made and where to.
			 *
			 * The `ajax` property has three different modes of operation, depending on
			 * how it is defined. These are:
			 *
			 * * `string` - Set the URL from where the data should be loaded from.
			 * * `object` - Define properties for `jQuery.ajax`.
			 * * `function` - Custom data get function
			 *
			 * `string`
			 * --------
			 *
			 * As a string, the `ajax` property simply defines the URL from which
			 * DataTables will load data.
			 *
			 * `object`
			 * --------
			 *
			 * As an object, the parameters in the object are passed to
			 * [jQuery.ajax](http://api.jquery.com/jQuery.ajax/) allowing fine control
			 * of the Ajax request. DataTables has a number of default parameters which
			 * you can override using this option. Please refer to the jQuery
			 * documentation for a full description of the options available, although
			 * the following parameters provide additional options in DataTables or
			 * require special consideration:
			 *
			 * * `data` - As with jQuery, `data` can be provided as an object, but it
			 *   can also be used as a function to manipulate the data DataTables sends
			 *   to the server. The function takes a single parameter, an object of
			 *   parameters with the values that DataTables has readied for sending. An
			 *   object may be returned which will be merged into the DataTables
			 *   defaults, or you can add the items to the object that was passed in and
			 *   not return anything from the function. This supersedes `fnServerParams`
			 *   from DataTables 1.9-.
			 *
			 * * `dataSrc` - By default DataTables will look for the property `data` (or
			 *   `aaData` for compatibility with DataTables 1.9-) when obtaining data
			 *   from an Ajax source or for server-side processing - this parameter
			 *   allows that property to be changed. You can use Javascript dotted
			 *   object notation to get a data source for multiple levels of nesting, or
			 *   it my be used as a function. As a function it takes a single parameter,
			 *   the JSON returned from the server, which can be manipulated as
			 *   required, with the returned value being that used by DataTables as the
			 *   data source for the table. This supersedes `sAjaxDataProp` from
			 *   DataTables 1.9-.
			 *
			 * * `success` - Should not be overridden it is used internally in
			 *   DataTables. To manipulate / transform the data returned by the server
			 *   use `ajax.dataSrc`, or use `ajax` as a function (see below).
			 *
			 * `function`
			 * ----------
			 *
			 * As a function, making the Ajax call is left up to yourself allowing
			 * complete control of the Ajax request. Indeed, if desired, a method other
			 * than Ajax could be used to obtain the required data, such as Web storage
			 * or an AIR database.
			 *
			 * The function is given four parameters and no return is required. The
			 * parameters are:
			 *
			 * 1. _object_ - Data to send to the server
			 * 2. _function_ - Callback function that must be executed when the required
			 *    data has been obtained. That data should be passed into the callback
			 *    as the only parameter
			 * 3. _object_ - DataTables settings object for the table
			 *
			 * Note that this supersedes `fnServerData` from DataTables 1.9-.
			 *
			 *  @type string|object|function
			 *  @default null
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.ajax
			 *  @since 1.10.0
			 *
			 * @example
			 *   // Get JSON data from a file via Ajax.
			 *   // Note DataTables expects data in the form `{ data: [ ...data... ] }` by default).
			 *   $('#example').dataTable( {
			 *     "ajax": "data.json"
			 *   } );
			 *
			 * @example
			 *   // Get JSON data from a file via Ajax, using `dataSrc` to change
			 *   // `data` to `tableData` (i.e. `{ tableData: [ ...data... ] }`)
			 *   $('#example').dataTable( {
			 *     "ajax": {
			 *       "url": "data.json",
			 *       "dataSrc": "tableData"
			 *     }
			 *   } );
			 *
			 * @example
			 *   // Get JSON data from a file via Ajax, using `dataSrc` to read data
			 *   // from a plain array rather than an array in an object
			 *   $('#example').dataTable( {
			 *     "ajax": {
			 *       "url": "data.json",
			 *       "dataSrc": ""
			 *     }
			 *   } );
			 *
			 * @example
			 *   // Manipulate the data returned from the server - add a link to data
			 *   // (note this can, should, be done using `render` for the column - this
			 *   // is just a simple example of how the data can be manipulated).
			 *   $('#example').dataTable( {
			 *     "ajax": {
			 *       "url": "data.json",
			 *       "dataSrc": function ( json ) {
			 *         for ( var i=0, ien=json.length ; i<ien ; i++ ) {
			 *           json[i][0] = '<a href="/message/'+json[i][0]+'>View message</a>';
			 *         }
			 *         return json;
			 *       }
			 *     }
			 *   } );
			 *
			 * @example
			 *   // Add data to the request
			 *   $('#example').dataTable( {
			 *     "ajax": {
			 *       "url": "data.json",
			 *       "data": function ( d ) {
			 *         return {
			 *           "extra_search": $('#extra').val()
			 *         };
			 *       }
			 *     }
			 *   } );
			 *
			 * @example
			 *   // Send request as POST
			 *   $('#example').dataTable( {
			 *     "ajax": {
			 *       "url": "data.json",
			 *       "type": "POST"
			 *     }
			 *   } );
			 *
			 * @example
			 *   // Get the data from localStorage (could interface with a form for
			 *   // adding, editing and removing rows).
			 *   $('#example').dataTable( {
			 *     "ajax": function (data, callback, settings) {
			 *       callback(
			 *         JSON.parse( localStorage.getItem('dataTablesData') )
			 *       );
			 *     }
			 *   } );
			 */
			"ajax": null,


			/**
			 * This parameter allows you to readily specify the entries in the length drop
			 * down menu that DataTables shows when pagination is enabled. It can be
			 * either a 1D array of options which will be used for both the displayed
			 * option and the value, or a 2D array which will use the array in the first
			 * position as the value, and the array in the second position as the
			 * displayed options (useful for language strings such as 'All').
			 *
			 * Note that the `pageLength` property will be automatically set to the
			 * first value given in this array, unless `pageLength` is also provided.
			 *  @type array
			 *  @default [ 10, 25, 50, 100 ]
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.lengthMenu
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]]
			 *      } );
			 *    } );
			 */
			"aLengthMenu": [10, 25, 50, 100],


			/**
			 * The `columns` option in the initialisation parameter allows you to define
			 * details about the way individual columns behave. For a full list of
			 * column options that can be set, please see
			 * {@link DataTable.defaults.column}. Note that if you use `columns` to
			 * define your columns, you must have an entry in the array for every single
			 * column that you have in your table (these can be null if you don't which
			 * to specify any options).
			 *  @member
			 *
			 *  @name DataTable.defaults.column
			 */
			"aoColumns": null,

			/**
			 * Very similar to `columns`, `columnDefs` allows you to target a specific
			 * column, multiple columns, or all columns, using the `targets` property of
			 * each object in the array. This allows great flexibility when creating
			 * tables, as the `columnDefs` arrays can be of any length, targeting the
			 * columns you specifically want. `columnDefs` may use any of the column
			 * options available: {@link DataTable.defaults.column}, but it _must_
			 * have `targets` defined in each object in the array. Values in the `targets`
			 * array may be:
			 *   <ul>
			 *     <li>a string - class name will be matched on the TH for the column</li>
			 *     <li>0 or a positive integer - column index counting from the left</li>
			 *     <li>a negative integer - column index counting from the right</li>
			 *     <li>the string "_all" - all columns (i.e. assign a default)</li>
			 *   </ul>
			 *  @member
			 *
			 *  @name DataTable.defaults.columnDefs
			 */
			"aoColumnDefs": null,


			/**
			 * Basically the same as `search`, this parameter defines the individual column
			 * filtering state at initialisation time. The array must be of the same size
			 * as the number of columns, and each element be an object with the parameters
			 * `search` and `escapeRegex` (the latter is optional). 'null' is also
			 * accepted and the default will be used.
			 *  @type array
			 *  @default []
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.searchCols
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "searchCols": [
			 *          null,
			 *          { "search": "My filter" },
			 *          null,
			 *          { "search": "^[0-9]", "escapeRegex": false }
			 *        ]
			 *      } );
			 *    } )
			 */
			"aoSearchCols": [],


			/**
			 * An array of CSS classes that should be applied to displayed rows. This
			 * array may be of any length, and DataTables will apply each class
			 * sequentially, looping when required.
			 *  @type array
			 *  @default null <i>Will take the values determined by the `oClasses.stripe*`
			 *    options</i>
			 *
			 *  @dtopt Option
			 *  @name DataTable.defaults.stripeClasses
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stripeClasses": [ 'strip1', 'strip2', 'strip3' ]
			 *      } );
			 *    } )
			 */
			"asStripeClasses": null,


			/**
			 * Enable or disable automatic column width calculation. This can be disabled
			 * as an optimisation (it takes some time to calculate the widths) if the
			 * tables widths are passed in using `columns`.
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.autoWidth
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "autoWidth": false
			 *      } );
			 *    } );
			 */
			"bAutoWidth": true,


			/**
			 * Deferred rendering can provide DataTables with a huge speed boost when you
			 * are using an Ajax or JS data source for the table. This option, when set to
			 * true, will cause DataTables to defer the creation of the table elements for
			 * each row until they are needed for a draw - saving a significant amount of
			 * time.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.deferRender
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "ajax": "sources/arrays.txt",
			 *        "deferRender": true
			 *      } );
			 *    } );
			 */
			"bDeferRender": false,


			/**
			 * Replace a DataTable which matches the given selector and replace it with
			 * one which has the properties of the new initialisation object passed. If no
			 * table matches the selector, then the new DataTable will be constructed as
			 * per normal.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.destroy
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "srollY": "200px",
			 *        "paginate": false
			 *      } );
			 *
			 *      // Some time later....
			 *      $('#example').dataTable( {
			 *        "filter": false,
			 *        "destroy": true
			 *      } );
			 *    } );
			 */
			"bDestroy": false,


			/**
			 * Enable or disable filtering of data. Filtering in DataTables is "smart" in
			 * that it allows the end user to input multiple words (space separated) and
			 * will match a row containing those words, even if not in the order that was
			 * specified (this allow matching across multiple columns). Note that if you
			 * wish to use filtering in DataTables this must remain 'true' - to remove the
			 * default filtering input box and retain filtering abilities, please use
			 * {@link DataTable.defaults.dom}.
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.searching
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "searching": false
			 *      } );
			 *    } );
			 */
			"bFilter": true,


			/**
			 * Enable or disable the table information display. This shows information
			 * about the data that is currently visible on the page, including information
			 * about filtered data if that action is being performed.
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.info
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "info": false
			 *      } );
			 *    } );
			 */
			"bInfo": true,


			/**
			 * Allows the end user to select the size of a formatted page from a select
			 * menu (sizes are 10, 25, 50 and 100). Requires pagination (`paginate`).
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.lengthChange
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "lengthChange": false
			 *      } );
			 *    } );
			 */
			"bLengthChange": true,


			/**
			 * Enable or disable pagination.
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.paging
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "paging": false
			 *      } );
			 *    } );
			 */
			"bPaginate": true,


			/**
			 * Enable or disable the display of a 'processing' indicator when the table is
			 * being processed (e.g. a sort). This is particularly useful for tables with
			 * large amounts of data where it can take a noticeable amount of time to sort
			 * the entries.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.processing
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "processing": true
			 *      } );
			 *    } );
			 */
			"bProcessing": false,


			/**
			 * Retrieve the DataTables object for the given selector. Note that if the
			 * table has already been initialised, this parameter will cause DataTables
			 * to simply return the object that has already been set up - it will not take
			 * account of any changes you might have made to the initialisation object
			 * passed to DataTables (setting this parameter to true is an acknowledgement
			 * that you understand this). `destroy` can be used to reinitialise a table if
			 * you need.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.retrieve
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      initTable();
			 *      tableActions();
			 *    } );
			 *
			 *    function initTable ()
			 *    {
			 *      return $('#example').dataTable( {
			 *        "scrollY": "200px",
			 *        "paginate": false,
			 *        "retrieve": true
			 *      } );
			 *    }
			 *
			 *    function tableActions ()
			 *    {
			 *      var table = initTable();
			 *      // perform API operations with oTable
			 *    }
			 */
			"bRetrieve": false,


			/**
			 * When vertical (y) scrolling is enabled, DataTables will force the height of
			 * the table's viewport to the given height at all times (useful for layout).
			 * However, this can look odd when filtering data down to a small data set,
			 * and the footer is left "floating" further down. This parameter (when
			 * enabled) will cause DataTables to collapse the table's viewport down when
			 * the result set will fit within the given Y height.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.scrollCollapse
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "scrollY": "200",
			 *        "scrollCollapse": true
			 *      } );
			 *    } );
			 */
			"bScrollCollapse": false,


			/**
			 * Configure DataTables to use server-side processing. Note that the
			 * `ajax` parameter must also be given in order to give DataTables a
			 * source to obtain the required data for each draw.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Features
			 *  @dtopt Server-side
			 *  @name DataTable.defaults.serverSide
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "serverSide": true,
			 *        "ajax": "xhr.php"
			 *      } );
			 *    } );
			 */
			"bServerSide": false,


			/**
			 * Enable or disable sorting of columns. Sorting of individual columns can be
			 * disabled by the `sortable` option for each column.
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.ordering
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "ordering": false
			 *      } );
			 *    } );
			 */
			"bSort": true,


			/**
			 * Enable or display DataTables' ability to sort multiple columns at the
			 * same time (activated by shift-click by the user).
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.orderMulti
			 *
			 *  @example
			 *    // Disable multiple column sorting ability
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "orderMulti": false
			 *      } );
			 *    } );
			 */
			"bSortMulti": true,


			/**
			 * Allows control over whether DataTables should use the top (true) unique
			 * cell that is found for a single column, or the bottom (false - default).
			 * This is useful when using complex headers.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.orderCellsTop
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "orderCellsTop": true
			 *      } );
			 *    } );
			 */
			"bSortCellsTop": false,


			/**
			 * Enable or disable the addition of the classes `sorting\_1`, `sorting\_2` and
			 * `sorting\_3` to the columns which are currently being sorted on. This is
			 * presented as a feature switch as it can increase processing time (while
			 * classes are removed and added) so for large data sets you might want to
			 * turn this off.
			 *  @type boolean
			 *  @default true
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.orderClasses
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "orderClasses": false
			 *      } );
			 *    } );
			 */
			"bSortClasses": true,


			/**
			 * Enable or disable state saving. When enabled HTML5 `localStorage` will be
			 * used to save table display information such as pagination information,
			 * display length, filtering and sorting. As such when the end user reloads
			 * the page the display display will match what thy had previously set up.
			 *
			 * Due to the use of `localStorage` the default state saving is not supported
			 * in IE6 or 7. If state saving is required in those browsers, use
			 * `stateSaveCallback` to provide a storage solution such as cookies.
			 *  @type boolean
			 *  @default false
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.stateSave
			 *
			 *  @example
			 *    $(document).ready( function () {
			 *      $('#example').dataTable( {
			 *        "stateSave": true
			 *      } );
			 *    } );
			 */
			"bStateSave": false,


			/**
			 * This function is called when a TR element is created (and all TD child
			 * elements have been inserted), or registered if using a DOM source, allowing
			 * manipulation of the TR element (adding classes etc).
			 *  @type function
			 *  @param {node} row "TR" element for the current row
			 *  @param {array} data Raw data array for this row
			 *  @param {int} dataIndex The index of this row in the internal aoData array
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.createdRow
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "createdRow": function( row, data, dataIndex ) {
			 *          // Bold the grade for all 'A' grade browsers
			 *          if ( data[4] == "A" )
			 *          {
			 *            $('td:eq(4)', row).html( '<b>A</b>' );
			 *          }
			 *        }
			 *      } );
			 *    } );
			 */
			"fnCreatedRow": null,


			/**
			 * This function is called on every 'draw' event, and allows you to
			 * dynamically modify any aspect you want about the created DOM.
			 *  @type function
			 *  @param {object} settings DataTables settings object
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.drawCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "drawCallback": function( settings ) {
			 *          alert( 'DataTables has redrawn the table' );
			 *        }
			 *      } );
			 *    } );
			 */
			"fnDrawCallback": null,


			/**
			 * Identical to fnHeaderCallback() but for the table footer this function
			 * allows you to modify the table footer on every 'draw' event.
			 *  @type function
			 *  @param {node} foot "TR" element for the footer
			 *  @param {array} data Full table data (as derived from the original HTML)
			 *  @param {int} start Index for the current display starting point in the
			 *    display array
			 *  @param {int} end Index for the current display ending point in the
			 *    display array
			 *  @param {array int} display Index array to translate the visual position
			 *    to the full data array
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.footerCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "footerCallback": function( tfoot, data, start, end, display ) {
			 *          tfoot.getElementsByTagName('th')[0].innerHTML = "Starting index is "+start;
			 *        }
			 *      } );
			 *    } )
			 */
			"fnFooterCallback": null,


			/**
			 * When rendering large numbers in the information element for the table
			 * (i.e. "Showing 1 to 10 of 57 entries") DataTables will render large numbers
			 * to have a comma separator for the 'thousands' units (e.g. 1 million is
			 * rendered as "1,000,000") to help readability for the end user. This
			 * function will override the default method DataTables uses.
			 *  @type function
			 *  @member
			 *  @param {int} toFormat number to be formatted
			 *  @returns {string} formatted string for DataTables to show the number
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.formatNumber
			 *
			 *  @example
			 *    // Format a number using a single quote for the separator (note that
			 *    // this can also be done with the language.thousands option)
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "formatNumber": function ( toFormat ) {
			 *          return toFormat.toString().replace(
			 *            /\B(?=(\d{3})+(?!\d))/g, "'"
			 *          );
			 *        };
			 *      } );
			 *    } );
			 */
			"fnFormatNumber": function (toFormat) {
				return toFormat.toString().replace(
					/\B(?=(\d{3})+(?!\d))/g,
					this.oLanguage.sThousands
				);
			},


			/**
			 * This function is called on every 'draw' event, and allows you to
			 * dynamically modify the header row. This can be used to calculate and
			 * display useful information about the table.
			 *  @type function
			 *  @param {node} head "TR" element for the header
			 *  @param {array} data Full table data (as derived from the original HTML)
			 *  @param {int} start Index for the current display starting point in the
			 *    display array
			 *  @param {int} end Index for the current display ending point in the
			 *    display array
			 *  @param {array int} display Index array to translate the visual position
			 *    to the full data array
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.headerCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "fheaderCallback": function( head, data, start, end, display ) {
			 *          head.getElementsByTagName('th')[0].innerHTML = "Displaying "+(end-start)+" records";
			 *        }
			 *      } );
			 *    } )
			 */
			"fnHeaderCallback": null,


			/**
			 * The information element can be used to convey information about the current
			 * state of the table. Although the internationalisation options presented by
			 * DataTables are quite capable of dealing with most customisations, there may
			 * be times where you wish to customise the string further. This callback
			 * allows you to do exactly that.
			 *  @type function
			 *  @param {object} oSettings DataTables settings object
			 *  @param {int} start Starting position in data for the draw
			 *  @param {int} end End position in data for the draw
			 *  @param {int} max Total number of rows in the table (regardless of
			 *    filtering)
			 *  @param {int} total Total number of rows in the data set, after filtering
			 *  @param {string} pre The string that DataTables has formatted using it's
			 *    own rules
			 *  @returns {string} The string to be displayed in the information element.
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.infoCallback
			 *
			 *  @example
			 *    $('#example').dataTable( {
			 *      "infoCallback": function( settings, start, end, max, total, pre ) {
			 *        return start +" to "+ end;
			 *      }
			 *    } );
			 */
			"fnInfoCallback": null,


			/**
			 * Called when the table has been initialised. Normally DataTables will
			 * initialise sequentially and there will be no need for this function,
			 * however, this does not hold true when using external language information
			 * since that is obtained using an async XHR call.
			 *  @type function
			 *  @param {object} settings DataTables settings object
			 *  @param {object} json The JSON object request from the server - only
			 *    present if client-side Ajax sourced data is used
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.initComplete
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "initComplete": function(settings, json) {
			 *          alert( 'DataTables has finished its initialisation.' );
			 *        }
			 *      } );
			 *    } )
			 */
			"fnInitComplete": null,


			/**
			 * Called at the very start of each table draw and can be used to cancel the
			 * draw by returning false, any other return (including undefined) results in
			 * the full draw occurring).
			 *  @type function
			 *  @param {object} settings DataTables settings object
			 *  @returns {boolean} False will cancel the draw, anything else (including no
			 *    return) will allow it to complete.
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.preDrawCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "preDrawCallback": function( settings ) {
			 *          if ( $('#test').val() == 1 ) {
			 *            return false;
			 *          }
			 *        }
			 *      } );
			 *    } );
			 */
			"fnPreDrawCallback": null,


			/**
			 * This function allows you to 'post process' each row after it have been
			 * generated for each table draw, but before it is rendered on screen. This
			 * function might be used for setting the row class name etc.
			 *  @type function
			 *  @param {node} row "TR" element for the current row
			 *  @param {array} data Raw data array for this row
			 *  @param {int} displayIndex The display index for the current table draw
			 *  @param {int} displayIndexFull The index of the data in the full list of
			 *    rows (after filtering)
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.rowCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "rowCallback": function( row, data, displayIndex, displayIndexFull ) {
			 *          // Bold the grade for all 'A' grade browsers
			 *          if ( data[4] == "A" ) {
			 *            $('td:eq(4)', row).html( '<b>A</b>' );
			 *          }
			 *        }
			 *      } );
			 *    } );
			 */
			"fnRowCallback": null,


			/**
			 * __Deprecated__ The functionality provided by this parameter has now been
			 * superseded by that provided through `ajax`, which should be used instead.
			 *
			 * This parameter allows you to override the default function which obtains
			 * the data from the server so something more suitable for your application.
			 * For example you could use POST data, or pull information from a Gears or
			 * AIR database.
			 *  @type function
			 *  @member
			 *  @param {string} source HTTP source to obtain the data from (`ajax`)
			 *  @param {array} data A key/value pair object containing the data to send
			 *    to the server
			 *  @param {function} callback to be called on completion of the data get
			 *    process that will draw the data on the page.
			 *  @param {object} settings DataTables settings object
			 *
			 *  @dtopt Callbacks
			 *  @dtopt Server-side
			 *  @name DataTable.defaults.serverData
			 *
			 *  @deprecated 1.10. Please use `ajax` for this functionality now.
			 */
			"fnServerData": null,


			/**
			 * __Deprecated__ The functionality provided by this parameter has now been
			 * superseded by that provided through `ajax`, which should be used instead.
			 *
			 *  It is often useful to send extra data to the server when making an Ajax
			 * request - for example custom filtering information, and this callback
			 * function makes it trivial to send extra information to the server. The
			 * passed in parameter is the data set that has been constructed by
			 * DataTables, and you can add to this or modify it as you require.
			 *  @type function
			 *  @param {array} data Data array (array of objects which are name/value
			 *    pairs) that has been constructed by DataTables and will be sent to the
			 *    server. In the case of Ajax sourced data with server-side processing
			 *    this will be an empty array, for server-side processing there will be a
			 *    significant number of parameters!
			 *  @returns {undefined} Ensure that you modify the data array passed in,
			 *    as this is passed by reference.
			 *
			 *  @dtopt Callbacks
			 *  @dtopt Server-side
			 *  @name DataTable.defaults.serverParams
			 *
			 *  @deprecated 1.10. Please use `ajax` for this functionality now.
			 */
			"fnServerParams": null,


			/**
			 * Load the table state. With this function you can define from where, and how, the
			 * state of a table is loaded. By default DataTables will load from `localStorage`
			 * but you might wish to use a server-side database or cookies.
			 *  @type function
			 *  @member
			 *  @param {object} settings DataTables settings object
			 *  @param {object} callback Callback that can be executed when done. It
			 *    should be passed the loaded state object.
			 *  @return {object} The DataTables state object to be loaded
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.stateLoadCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateSave": true,
			 *        "stateLoadCallback": function (settings, callback) {
			 *          $.ajax( {
			 *            "url": "/state_load",
			 *            "dataType": "json",
			 *            "success": function (json) {
			 *              callback( json );
			 *            }
			 *          } );
			 *        }
			 *      } );
			 *    } );
			 */
			"fnStateLoadCallback": function (settings) {
				try {
					return JSON.parse(
						(settings.iStateDuration === -1 ? sessionStorage : localStorage).getItem(
							'DataTables_' + settings.sInstance + '_' + location.pathname
						)
					);
				} catch (e) {
					return {};
				}
			},


			/**
			 * Callback which allows modification of the saved state prior to loading that state.
			 * This callback is called when the table is loading state from the stored data, but
			 * prior to the settings object being modified by the saved state. Note that for
			 * plug-in authors, you should use the `stateLoadParams` event to load parameters for
			 * a plug-in.
			 *  @type function
			 *  @param {object} settings DataTables settings object
			 *  @param {object} data The state object that is to be loaded
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.stateLoadParams
			 *
			 *  @example
			 *    // Remove a saved filter, so filtering is never loaded
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateSave": true,
			 *        "stateLoadParams": function (settings, data) {
			 *          data.oSearch.sSearch = "";
			 *        }
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Disallow state loading by returning false
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateSave": true,
			 *        "stateLoadParams": function (settings, data) {
			 *          return false;
			 *        }
			 *      } );
			 *    } );
			 */
			"fnStateLoadParams": null,


			/**
			 * Callback that is called when the state has been loaded from the state saving method
			 * and the DataTables settings object has been modified as a result of the loaded state.
			 *  @type function
			 *  @param {object} settings DataTables settings object
			 *  @param {object} data The state object that was loaded
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.stateLoaded
			 *
			 *  @example
			 *    // Show an alert with the filtering value that was saved
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateSave": true,
			 *        "stateLoaded": function (settings, data) {
			 *          alert( 'Saved filter was: '+data.oSearch.sSearch );
			 *        }
			 *      } );
			 *    } );
			 */
			"fnStateLoaded": null,


			/**
			 * Save the table state. This function allows you to define where and how the state
			 * information for the table is stored By default DataTables will use `localStorage`
			 * but you might wish to use a server-side database or cookies.
			 *  @type function
			 *  @member
			 *  @param {object} settings DataTables settings object
			 *  @param {object} data The state object to be saved
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.stateSaveCallback
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateSave": true,
			 *        "stateSaveCallback": function (settings, data) {
			 *          // Send an Ajax request to the server with the state object
			 *          $.ajax( {
			 *            "url": "/state_save",
			 *            "data": data,
			 *            "dataType": "json",
			 *            "method": "POST"
			 *            "success": function () {}
			 *          } );
			 *        }
			 *      } );
			 *    } );
			 */
			"fnStateSaveCallback": function (settings, data) {
				try {
					(settings.iStateDuration === -1 ? sessionStorage : localStorage).setItem(
						'DataTables_' + settings.sInstance + '_' + location.pathname,
						JSON.stringify(data)
					);
				} catch (e) { }
			},


			/**
			 * Callback which allows modification of the state to be saved. Called when the table
			 * has changed state a new state save is required. This method allows modification of
			 * the state saving object prior to actually doing the save, including addition or
			 * other state properties or modification. Note that for plug-in authors, you should
			 * use the `stateSaveParams` event to save parameters for a plug-in.
			 *  @type function
			 *  @param {object} settings DataTables settings object
			 *  @param {object} data The state object to be saved
			 *
			 *  @dtopt Callbacks
			 *  @name DataTable.defaults.stateSaveParams
			 *
			 *  @example
			 *    // Remove a saved filter, so filtering is never saved
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateSave": true,
			 *        "stateSaveParams": function (settings, data) {
			 *          data.oSearch.sSearch = "";
			 *        }
			 *      } );
			 *    } );
			 */
			"fnStateSaveParams": null,


			/**
			 * Duration for which the saved state information is considered valid. After this period
			 * has elapsed the state will be returned to the default.
			 * Value is given in seconds.
			 *  @type int
			 *  @default 7200 <i>(2 hours)</i>
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.stateDuration
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "stateDuration": 60*60*24; // 1 day
			 *      } );
			 *    } )
			 */
			"iStateDuration": 7200,


			/**
			 * When enabled DataTables will not make a request to the server for the first
			 * page draw - rather it will use the data already on the page (no sorting etc
			 * will be applied to it), thus saving on an XHR at load time. `deferLoading`
			 * is used to indicate that deferred loading is required, but it is also used
			 * to tell DataTables how many records there are in the full table (allowing
			 * the information element and pagination to be displayed correctly). In the case
			 * where a filtering is applied to the table on initial load, this can be
			 * indicated by giving the parameter as an array, where the first element is
			 * the number of records available after filtering and the second element is the
			 * number of records without filtering (allowing the table information element
			 * to be shown correctly).
			 *  @type int | array
			 *  @default null
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.deferLoading
			 *
			 *  @example
			 *    // 57 records available in the table, no filtering applied
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "serverSide": true,
			 *        "ajax": "scripts/server_processing.php",
			 *        "deferLoading": 57
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // 57 records after filtering, 100 without filtering (an initial filter applied)
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "serverSide": true,
			 *        "ajax": "scripts/server_processing.php",
			 *        "deferLoading": [ 57, 100 ],
			 *        "search": {
			 *          "search": "my_filter"
			 *        }
			 *      } );
			 *    } );
			 */
			"iDeferLoading": null,


			/**
			 * Number of rows to display on a single page when using pagination. If
			 * feature enabled (`lengthChange`) then the end user will be able to override
			 * this to a custom setting using a pop-up menu.
			 *  @type int
			 *  @default 10
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.pageLength
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "pageLength": 50
			 *      } );
			 *    } )
			 */
			"iDisplayLength": 10,


			/**
			 * Define the starting point for data display when using DataTables with
			 * pagination. Note that this parameter is the number of records, rather than
			 * the page number, so if you have 10 records per page and want to start on
			 * the third page, it should be "20".
			 *  @type int
			 *  @default 0
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.displayStart
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "displayStart": 20
			 *      } );
			 *    } )
			 */
			"iDisplayStart": 0,


			/**
			 * By default DataTables allows keyboard navigation of the table (sorting, paging,
			 * and filtering) by adding a `tabindex` attribute to the required elements. This
			 * allows you to tab through the controls and press the enter key to activate them.
			 * The tabindex is default 0, meaning that the tab follows the flow of the document.
			 * You can overrule this using this parameter if you wish. Use a value of -1 to
			 * disable built-in keyboard navigation.
			 *  @type int
			 *  @default 0
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.tabIndex
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "tabIndex": 1
			 *      } );
			 *    } );
			 */
			"iTabIndex": 0,


			/**
			 * Classes that DataTables assigns to the various components and features
			 * that it adds to the HTML table. This allows classes to be configured
			 * during initialisation in addition to through the static
			 * {@link DataTable.ext.oStdClasses} object).
			 *  @namespace
			 *  @name DataTable.defaults.classes
			 */
			"oClasses": {},


			/**
			 * All strings that DataTables uses in the user interface that it creates
			 * are defined in this object, allowing you to modified them individually or
			 * completely replace them all as required.
			 *  @namespace
			 *  @name DataTable.defaults.language
			 */
			"oLanguage": {
				/**
				 * Strings that are used for WAI-ARIA labels and controls only (these are not
				 * actually visible on the page, but will be read by screenreaders, and thus
				 * must be internationalised as well).
				 *  @namespace
				 *  @name DataTable.defaults.language.aria
				 */
				"oAria": {
					/**
					 * ARIA label that is added to the table headers when the column may be
					 * sorted ascending by activing the column (click or return when focused).
					 * Note that the column header is prefixed to this string.
					 *  @type string
					 *  @default : activate to sort column ascending
					 *
					 *  @dtopt Language
					 *  @name DataTable.defaults.language.aria.sortAscending
					 *
					 *  @example
					 *    $(document).ready( function() {
					 *      $('#example').dataTable( {
					 *        "language": {
					 *          "aria": {
					 *            "sortAscending": " - click/return to sort ascending"
					 *          }
					 *        }
					 *      } );
					 *    } );
					 */
					"sSortAscending": ": activate to sort column ascending",

					/**
					 * ARIA label that is added to the table headers when the column may be
					 * sorted descending by activing the column (click or return when focused).
					 * Note that the column header is prefixed to this string.
					 *  @type string
					 *  @default : activate to sort column ascending
					 *
					 *  @dtopt Language
					 *  @name DataTable.defaults.language.aria.sortDescending
					 *
					 *  @example
					 *    $(document).ready( function() {
					 *      $('#example').dataTable( {
					 *        "language": {
					 *          "aria": {
					 *            "sortDescending": " - click/return to sort descending"
					 *          }
					 *        }
					 *      } );
					 *    } );
					 */
					"sSortDescending": ": activate to sort column descending"
				},

				/**
				 * Pagination string used by DataTables for the built-in pagination
				 * control types.
				 *  @namespace
				 *  @name DataTable.defaults.language.paginate
				 */
				"oPaginate": {
					/**
					 * Text to use when using the 'full_numbers' type of pagination for the
					 * button to take the user to the first page.
					 *  @type string
					 *  @default First
					 *
					 *  @dtopt Language
					 *  @name DataTable.defaults.language.paginate.first
					 *
					 *  @example
					 *    $(document).ready( function() {
					 *      $('#example').dataTable( {
					 *        "language": {
					 *          "paginate": {
					 *            "first": "First page"
					 *          }
					 *        }
					 *      } );
					 *    } );
					 */
					"sFirst": "First",


					/**
					 * Text to use when using the 'full_numbers' type of pagination for the
					 * button to take the user to the last page.
					 *  @type string
					 *  @default Last
					 *
					 *  @dtopt Language
					 *  @name DataTable.defaults.language.paginate.last
					 *
					 *  @example
					 *    $(document).ready( function() {
					 *      $('#example').dataTable( {
					 *        "language": {
					 *          "paginate": {
					 *            "last": "Last page"
					 *          }
					 *        }
					 *      } );
					 *    } );
					 */
					"sLast": "Last",


					/**
					 * Text to use for the 'next' pagination button (to take the user to the
					 * next page).
					 *  @type string
					 *  @default Next
					 *
					 *  @dtopt Language
					 *  @name DataTable.defaults.language.paginate.next
					 *
					 *  @example
					 *    $(document).ready( function() {
					 *      $('#example').dataTable( {
					 *        "language": {
					 *          "paginate": {
					 *            "next": "Next page"
					 *          }
					 *        }
					 *      } );
					 *    } );
					 */
					"sNext": "Next",


					/**
					 * Text to use for the 'previous' pagination button (to take the user to
					 * the previous page).
					 *  @type string
					 *  @default Previous
					 *
					 *  @dtopt Language
					 *  @name DataTable.defaults.language.paginate.previous
					 *
					 *  @example
					 *    $(document).ready( function() {
					 *      $('#example').dataTable( {
					 *        "language": {
					 *          "paginate": {
					 *            "previous": "Previous page"
					 *          }
					 *        }
					 *      } );
					 *    } );
					 */
					"sPrevious": "Previous"
				},

				/**
				 * This string is shown in preference to `zeroRecords` when the table is
				 * empty of data (regardless of filtering). Note that this is an optional
				 * parameter - if it is not given, the value of `zeroRecords` will be used
				 * instead (either the default or given value).
				 *  @type string
				 *  @default No data available in table
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.emptyTable
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "emptyTable": "No data available in table"
				 *        }
				 *      } );
				 *    } );
				 */
				"sEmptyTable": "No data available in table",


				/**
				 * This string gives information to the end user about the information
				 * that is current on display on the page. The following tokens can be
				 * used in the string and will be dynamically replaced as the table
				 * display updates. This tokens can be placed anywhere in the string, or
				 * removed as needed by the language requires:
				 *
				 * * `\_START\_` - Display index of the first record on the current page
				 * * `\_END\_` - Display index of the last record on the current page
				 * * `\_TOTAL\_` - Number of records in the table after filtering
				 * * `\_MAX\_` - Number of records in the table without filtering
				 * * `\_PAGE\_` - Current page number
				 * * `\_PAGES\_` - Total number of pages of data in the table
				 *
				 *  @type string
				 *  @default Showing _START_ to _END_ of _TOTAL_ entries
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.info
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "info": "Showing page _PAGE_ of _PAGES_"
				 *        }
				 *      } );
				 *    } );
				 */
				"sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",


				/**
				 * Display information string for when the table is empty. Typically the
				 * format of this string should match `info`.
				 *  @type string
				 *  @default Showing 0 to 0 of 0 entries
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.infoEmpty
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "infoEmpty": "No entries to show"
				 *        }
				 *      } );
				 *    } );
				 */
				"sInfoEmpty": "Showing 0 to 0 of 0 entries",


				/**
				 * When a user filters the information in a table, this string is appended
				 * to the information (`info`) to give an idea of how strong the filtering
				 * is. The variable _MAX_ is dynamically updated.
				 *  @type string
				 *  @default (filtered from _MAX_ total entries)
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.infoFiltered
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "infoFiltered": " - filtering from _MAX_ records"
				 *        }
				 *      } );
				 *    } );
				 */
				"sInfoFiltered": "(filtered from _MAX_ total entries)",


				/**
				 * If can be useful to append extra information to the info string at times,
				 * and this variable does exactly that. This information will be appended to
				 * the `info` (`infoEmpty` and `infoFiltered` in whatever combination they are
				 * being used) at all times.
				 *  @type string
				 *  @default <i>Empty string</i>
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.infoPostFix
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "infoPostFix": "All records shown are derived from real information."
				 *        }
				 *      } );
				 *    } );
				 */
				"sInfoPostFix": "",


				/**
				 * This decimal place operator is a little different from the other
				 * language options since DataTables doesn't output floating point
				 * numbers, so it won't ever use this for display of a number. Rather,
				 * what this parameter does is modify the sort methods of the table so
				 * that numbers which are in a format which has a character other than
				 * a period (`.`) as a decimal place will be sorted numerically.
				 *
				 * Note that numbers with different decimal places cannot be shown in
				 * the same table and still be sortable, the table must be consistent.
				 * However, multiple different tables on the page can use different
				 * decimal place characters.
				 *  @type string
				 *  @default 
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.decimal
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "decimal": ","
				 *          "thousands": "."
				 *        }
				 *      } );
				 *    } );
				 */
				"sDecimal": "",


				/**
				 * DataTables has a build in number formatter (`formatNumber`) which is
				 * used to format large numbers that are used in the table information.
				 * By default a comma is used, but this can be trivially changed to any
				 * character you wish with this parameter.
				 *  @type string
				 *  @default ,
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.thousands
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "thousands": "'"
				 *        }
				 *      } );
				 *    } );
				 */
				"sThousands": ",",


				/**
				 * Detail the action that will be taken when the drop down menu for the
				 * pagination length option is changed. The '_MENU_' variable is replaced
				 * with a default select list of 10, 25, 50 and 100, and can be replaced
				 * with a custom select box if required.
				 *  @type string
				 *  @default Show _MENU_ entries
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.lengthMenu
				 *
				 *  @example
				 *    // Language change only
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "lengthMenu": "Display _MENU_ records"
				 *        }
				 *      } );
				 *    } );
				 *
				 *  @example
				 *    // Language and options change
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "lengthMenu": 'Display <select>'+
				 *            '<option value="10">10</option>'+
				 *            '<option value="20">20</option>'+
				 *            '<option value="30">30</option>'+
				 *            '<option value="40">40</option>'+
				 *            '<option value="50">50</option>'+
				 *            '<option value="-1">All</option>'+
				 *            '</select> records'
				 *        }
				 *      } );
				 *    } );
				 */
				"sLengthMenu": "Show _MENU_ entries",


				/**
				 * When using Ajax sourced data and during the first draw when DataTables is
				 * gathering the data, this message is shown in an empty row in the table to
				 * indicate to the end user the the data is being loaded. Note that this
				 * parameter is not used when loading data by server-side processing, just
				 * Ajax sourced data with client-side processing.
				 *  @type string
				 *  @default Loading...
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.loadingRecords
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "loadingRecords": "Please wait - loading..."
				 *        }
				 *      } );
				 *    } );
				 */
				"sLoadingRecords": "Loading...",


				/**
				 * Text which is displayed when the table is processing a user action
				 * (usually a sort command or similar).
				 *  @type string
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.processing
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "processing": "DataTables is currently busy"
				 *        }
				 *      } );
				 *    } );
				 */
				"sProcessing": "",


				/**
				 * Details the actions that will be taken when the user types into the
				 * filtering input text box. The variable "_INPUT_", if used in the string,
				 * is replaced with the HTML text box for the filtering input allowing
				 * control over where it appears in the string. If "_INPUT_" is not given
				 * then the input box is appended to the string automatically.
				 *  @type string
				 *  @default Search:
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.search
				 *
				 *  @example
				 *    // Input text box will be appended at the end automatically
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "search": "Filter records:"
				 *        }
				 *      } );
				 *    } );
				 *
				 *  @example
				 *    // Specify where the filter should appear
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "search": "Apply filter _INPUT_ to table"
				 *        }
				 *      } );
				 *    } );
				 */
				"sSearch": "Search:",


				/**
				 * Assign a `placeholder` attribute to the search `input` element
				 *  @type string
				 *  @default 
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.searchPlaceholder
				 */
				"sSearchPlaceholder": "",


				/**
				 * All of the language information can be stored in a file on the
				 * server-side, which DataTables will look up if this parameter is passed.
				 * It must store the URL of the language file, which is in a JSON format,
				 * and the object has the same properties as the oLanguage object in the
				 * initialiser object (i.e. the above parameters). Please refer to one of
				 * the example language files to see how this works in action.
				 *  @type string
				 *  @default <i>Empty string - i.e. disabled</i>
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.url
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "url": "http://www.sprymedia.co.uk/dataTables/lang.txt"
				 *        }
				 *      } );
				 *    } );
				 */
				"sUrl": "",


				/**
				 * Text shown inside the table records when the is no information to be
				 * displayed after filtering. `emptyTable` is shown when there is simply no
				 * information in the table at all (regardless of filtering).
				 *  @type string
				 *  @default No matching records found
				 *
				 *  @dtopt Language
				 *  @name DataTable.defaults.language.zeroRecords
				 *
				 *  @example
				 *    $(document).ready( function() {
				 *      $('#example').dataTable( {
				 *        "language": {
				 *          "zeroRecords": "No records to display"
				 *        }
				 *      } );
				 *    } );
				 */
				"sZeroRecords": "No matching records found"
			},


			/**
			 * This parameter allows you to have define the global filtering state at
			 * initialisation time. As an object the `search` parameter must be
			 * defined, but all other parameters are optional. When `regex` is true,
			 * the search string will be treated as a regular expression, when false
			 * (default) it will be treated as a straight string. When `smart`
			 * DataTables will use it's smart filtering methods (to word match at
			 * any point in the data), when false this will not be done.
			 *  @namespace
			 *  @extends DataTable.models.oSearch
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.search
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "search": {"search": "Initial search"}
			 *      } );
			 *    } )
			 */
			"oSearch": $.extend({}, DataTable.models.oSearch),


			/**
			 * __Deprecated__ The functionality provided by this parameter has now been
			 * superseded by that provided through `ajax`, which should be used instead.
			 *
			 * By default DataTables will look for the property `data` (or `aaData` for
			 * compatibility with DataTables 1.9-) when obtaining data from an Ajax
			 * source or for server-side processing - this parameter allows that
			 * property to be changed. You can use Javascript dotted object notation to
			 * get a data source for multiple levels of nesting.
			 *  @type string
			 *  @default data
			 *
			 *  @dtopt Options
			 *  @dtopt Server-side
			 *  @name DataTable.defaults.ajaxDataProp
			 *
			 *  @deprecated 1.10. Please use `ajax` for this functionality now.
			 */
			"sAjaxDataProp": "data",


			/**
			 * __Deprecated__ The functionality provided by this parameter has now been
			 * superseded by that provided through `ajax`, which should be used instead.
			 *
			 * You can instruct DataTables to load data from an external
			 * source using this parameter (use aData if you want to pass data in you
			 * already have). Simply provide a url a JSON object can be obtained from.
			 *  @type string
			 *  @default null
			 *
			 *  @dtopt Options
			 *  @dtopt Server-side
			 *  @name DataTable.defaults.ajaxSource
			 *
			 *  @deprecated 1.10. Please use `ajax` for this functionality now.
			 */
			"sAjaxSource": null,


			/**
			 * This initialisation variable allows you to specify exactly where in the
			 * DOM you want DataTables to inject the various controls it adds to the page
			 * (for example you might want the pagination controls at the top of the
			 * table). DIV elements (with or without a custom class) can also be added to
			 * aid styling. The follow syntax is used:
			 *   <ul>
			 *     <li>The following options are allowed:
			 *       <ul>
			 *         <li>'l' - Length changing</li>
			 *         <li>'f' - Filtering input</li>
			 *         <li>'t' - The table!</li>
			 *         <li>'i' - Information</li>
			 *         <li>'p' - Pagination</li>
			 *         <li>'r' - pRocessing</li>
			 *       </ul>
			 *     </li>
			 *     <li>The following constants are allowed:
			 *       <ul>
			 *         <li>'H' - jQueryUI theme "header" classes ('fg-toolbar ui-widget-header ui-corner-tl ui-corner-tr ui-helper-clearfix')</li>
			 *         <li>'F' - jQueryUI theme "footer" classes ('fg-toolbar ui-widget-header ui-corner-bl ui-corner-br ui-helper-clearfix')</li>
			 *       </ul>
			 *     </li>
			 *     <li>The following syntax is expected:
			 *       <ul>
			 *         <li>'&lt;' and '&gt;' - div elements</li>
			 *         <li>'&lt;"class" and '&gt;' - div with a class</li>
			 *         <li>'&lt;"#id" and '&gt;' - div with an ID</li>
			 *       </ul>
			 *     </li>
			 *     <li>Examples:
			 *       <ul>
			 *         <li>'&lt;"wrapper"flipt&gt;'</li>
			 *         <li>'&lt;lf&lt;t&gt;ip&gt;'</li>
			 *       </ul>
			 *     </li>
			 *   </ul>
			 *  @type string
			 *  @default lfrtip <i>(when `jQueryUI` is false)</i> <b>or</b>
			 *    <"H"lfr>t<"F"ip> <i>(when `jQueryUI` is true)</i>
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.dom
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "dom": '&lt;"top"i&gt;rt&lt;"bottom"flp&gt;&lt;"clear"&gt;'
			 *      } );
			 *    } );
			 */
			"sDom": "lfrtip",


			/**
			 * Search delay option. This will throttle full table searches that use the
			 * DataTables provided search input element (it does not effect calls to
			 * `dt-api search()`, providing a delay before the search is made.
			 *  @type integer
			 *  @default 0
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.searchDelay
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "searchDelay": 200
			 *      } );
			 *    } )
			 */
			"searchDelay": null,


			/**
			 * DataTables features six different built-in options for the buttons to
			 * display for pagination control:
			 *
			 * * `numbers` - Page number buttons only
			 * * `simple` - 'Previous' and 'Next' buttons only
			 * * 'simple_numbers` - 'Previous' and 'Next' buttons, plus page numbers
			 * * `full` - 'First', 'Previous', 'Next' and 'Last' buttons
			 * * `full_numbers` - 'First', 'Previous', 'Next' and 'Last' buttons, plus page numbers
			 * * `first_last_numbers` - 'First' and 'Last' buttons, plus page numbers
			 *  
			 * Further methods can be added using {@link DataTable.ext.oPagination}.
			 *  @type string
			 *  @default simple_numbers
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.pagingType
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "pagingType": "full_numbers"
			 *      } );
			 *    } )
			 */
			"sPaginationType": "simple_numbers",


			/**
			 * Enable horizontal scrolling. When a table is too wide to fit into a
			 * certain layout, or you have a large number of columns in the table, you
			 * can enable x-scrolling to show the table in a viewport, which can be
			 * scrolled. This property can be `true` which will allow the table to
			 * scroll horizontally when needed, or any CSS unit, or a number (in which
			 * case it will be treated as a pixel measurement). Setting as simply `true`
			 * is recommended.
			 *  @type boolean|string
			 *  @default <i>blank string - i.e. disabled</i>
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.scrollX
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "scrollX": true,
			 *        "scrollCollapse": true
			 *      } );
			 *    } );
			 */
			"sScrollX": "",


			/**
			 * This property can be used to force a DataTable to use more width than it
			 * might otherwise do when x-scrolling is enabled. For example if you have a
			 * table which requires to be well spaced, this parameter is useful for
			 * "over-sizing" the table, and thus forcing scrolling. This property can by
			 * any CSS unit, or a number (in which case it will be treated as a pixel
			 * measurement).
			 *  @type string
			 *  @default <i>blank string - i.e. disabled</i>
			 *
			 *  @dtopt Options
			 *  @name DataTable.defaults.scrollXInner
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "scrollX": "100%",
			 *        "scrollXInner": "110%"
			 *      } );
			 *    } );
			 */
			"sScrollXInner": "",


			/**
			 * Enable vertical scrolling. Vertical scrolling will constrain the DataTable
			 * to the given height, and enable scrolling for any data which overflows the
			 * current viewport. This can be used as an alternative to paging to display
			 * a lot of data in a small area (although paging and scrolling can both be
			 * enabled at the same time). This property can be any CSS unit, or a number
			 * (in which case it will be treated as a pixel measurement).
			 *  @type string
			 *  @default <i>blank string - i.e. disabled</i>
			 *
			 *  @dtopt Features
			 *  @name DataTable.defaults.scrollY
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "scrollY": "200px",
			 *        "paginate": false
			 *      } );
			 *    } );
			 */
			"sScrollY": "",


			/**
			 * __Deprecated__ The functionality provided by this parameter has now been
			 * superseded by that provided through `ajax`, which should be used instead.
			 *
			 * Set the HTTP method that is used to make the Ajax call for server-side
			 * processing or Ajax sourced data.
			 *  @type string
			 *  @default GET
			 *
			 *  @dtopt Options
			 *  @dtopt Server-side
			 *  @name DataTable.defaults.serverMethod
			 *
			 *  @deprecated 1.10. Please use `ajax` for this functionality now.
			 */
			"sServerMethod": "GET",


			/**
			 * DataTables makes use of renderers when displaying HTML elements for
			 * a table. These renderers can be added or modified by plug-ins to
			 * generate suitable mark-up for a site. For example the Bootstrap
			 * integration plug-in for DataTables uses a paging button renderer to
			 * display pagination buttons in the mark-up required by Bootstrap.
			 *
			 * For further information about the renderers available see
			 * DataTable.ext.renderer
			 *  @type string|object
			 *  @default null
			 *
			 *  @name DataTable.defaults.renderer
			 *
			 */
			"renderer": null,


			/**
			 * Set the data property name that DataTables should use to get a row's id
			 * to set as the `id` property in the node.
			 *  @type string
			 *  @default DT_RowId
			 *
			 *  @name DataTable.defaults.rowId
			 */
			"rowId": "DT_RowId"
		};

		_fnHungarianMap(DataTable.defaults);



		/*
		 * Developer note - See note in model.defaults.js about the use of Hungarian
		 * notation and camel case.
		 */

		/**
		 * Column options that can be given to DataTables at initialisation time.
		 *  @namespace
		 */
		DataTable.defaults.column = {
			/**
			 * Define which column(s) an order will occur on for this column. This
			 * allows a column's ordering to take multiple columns into account when
			 * doing a sort or use the data from a different column. For example first
			 * name / last name columns make sense to do a multi-column sort over the
			 * two columns.
			 *  @type array|int
			 *  @default null <i>Takes the value of the column index automatically</i>
			 *
			 *  @name DataTable.defaults.column.orderData
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "orderData": [ 0, 1 ], "targets": [ 0 ] },
			 *          { "orderData": [ 1, 0 ], "targets": [ 1 ] },
			 *          { "orderData": 2, "targets": [ 2 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "orderData": [ 0, 1 ] },
			 *          { "orderData": [ 1, 0 ] },
			 *          { "orderData": 2 },
			 *          null,
			 *          null
			 *        ]
			 *      } );
			 *    } );
			 */
			"aDataSort": null,
			"iDataSort": -1,


			/**
			 * You can control the default ordering direction, and even alter the
			 * behaviour of the sort handler (i.e. only allow ascending ordering etc)
			 * using this parameter.
			 *  @type array
			 *  @default [ 'asc', 'desc' ]
			 *
			 *  @name DataTable.defaults.column.orderSequence
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "orderSequence": [ "asc" ], "targets": [ 1 ] },
			 *          { "orderSequence": [ "desc", "asc", "asc" ], "targets": [ 2 ] },
			 *          { "orderSequence": [ "desc" ], "targets": [ 3 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          null,
			 *          { "orderSequence": [ "asc" ] },
			 *          { "orderSequence": [ "desc", "asc", "asc" ] },
			 *          { "orderSequence": [ "desc" ] },
			 *          null
			 *        ]
			 *      } );
			 *    } );
			 */
			"asSorting": ['asc', 'desc'],


			/**
			 * Enable or disable filtering on the data in this column.
			 *  @type boolean
			 *  @default true
			 *
			 *  @name DataTable.defaults.column.searchable
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "searchable": false, "targets": [ 0 ] }
			 *        ] } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "searchable": false },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ] } );
			 *    } );
			 */
			"bSearchable": true,


			/**
			 * Enable or disable ordering on this column.
			 *  @type boolean
			 *  @default true
			 *
			 *  @name DataTable.defaults.column.orderable
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "orderable": false, "targets": [ 0 ] }
			 *        ] } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "orderable": false },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ] } );
			 *    } );
			 */
			"bSortable": true,


			/**
			 * Enable or disable the display of this column.
			 *  @type boolean
			 *  @default true
			 *
			 *  @name DataTable.defaults.column.visible
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "visible": false, "targets": [ 0 ] }
			 *        ] } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "visible": false },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ] } );
			 *    } );
			 */
			"bVisible": true,


			/**
			 * Developer definable function that is called whenever a cell is created (Ajax source,
			 * etc) or processed for input (DOM source). This can be used as a compliment to mRender
			 * allowing you to modify the DOM element (add background colour for example) when the
			 * element is available.
			 *  @type function
			 *  @param {element} td The TD node that has been created
			 *  @param {*} cellData The Data for the cell
			 *  @param {array|object} rowData The data for the whole row
			 *  @param {int} row The row index for the aoData data store
			 *  @param {int} col The column index for aoColumns
			 *
			 *  @name DataTable.defaults.column.createdCell
			 *  @dtopt Columns
			 *
			 *  @example
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [3],
			 *          "createdCell": function (td, cellData, rowData, row, col) {
			 *            if ( cellData == "1.7" ) {
			 *              $(td).css('color', 'blue')
			 *            }
			 *          }
			 *        } ]
			 *      });
			 *    } );
			 */
			"fnCreatedCell": null,


			/**
			 * This parameter has been replaced by `data` in DataTables to ensure naming
			 * consistency. `dataProp` can still be used, as there is backwards
			 * compatibility in DataTables for this option, but it is strongly
			 * recommended that you use `data` in preference to `dataProp`.
			 *  @name DataTable.defaults.column.dataProp
			 */


			/**
			 * This property can be used to read data from any data source property,
			 * including deeply nested objects / properties. `data` can be given in a
			 * number of different ways which effect its behaviour:
			 *
			 * * `integer` - treated as an array index for the data source. This is the
			 *   default that DataTables uses (incrementally increased for each column).
			 * * `string` - read an object property from the data source. There are
			 *   three 'special' options that can be used in the string to alter how
			 *   DataTables reads the data from the source object:
			 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
			 *      Javascript to read from nested objects, so to can the options
			 *      specified in `data`. For example: `browser.version` or
			 *      `browser.name`. If your object parameter name contains a period, use
			 *      `\\` to escape it - i.e. `first\\.name`.
			 *    * `[]` - Array notation. DataTables can automatically combine data
			 *      from and array source, joining the data with the characters provided
			 *      between the two brackets. For example: `name[, ]` would provide a
			 *      comma-space separated list from the source array. If no characters
			 *      are provided between the brackets, the original array source is
			 *      returned.
			 *    * `()` - Function notation. Adding `()` to the end of a parameter will
			 *      execute a function of the name given. For example: `browser()` for a
			 *      simple function on the data source, `browser.version()` for a
			 *      function in a nested property or even `browser().version` to get an
			 *      object property if the function called returns an object. Note that
			 *      function notation is recommended for use in `render` rather than
			 *      `data` as it is much simpler to use as a renderer.
			 * * `null` - use the original data source for the row rather than plucking
			 *   data directly from it. This action has effects on two other
			 *   initialisation options:
			 *    * `defaultContent` - When null is given as the `data` option and
			 *      `defaultContent` is specified for the column, the value defined by
			 *      `defaultContent` will be used for the cell.
			 *    * `render` - When null is used for the `data` option and the `render`
			 *      option is specified for the column, the whole data source for the
			 *      row is used for the renderer.
			 * * `function` - the function given will be executed whenever DataTables
			 *   needs to set or get the data for a cell in the column. The function
			 *   takes three parameters:
			 *    * Parameters:
			 *      * `{array|object}` The data source for the row
			 *      * `{string}` The type call data requested - this will be 'set' when
			 *        setting data or 'filter', 'display', 'type', 'sort' or undefined
			 *        when gathering data. Note that when `undefined` is given for the
			 *        type DataTables expects to get the raw data for the object back<
			 *      * `{*}` Data to set when the second parameter is 'set'.
			 *    * Return:
			 *      * The return value from the function is not required when 'set' is
			 *        the type of call, but otherwise the return is what will be used
			 *        for the data requested.
			 *
			 * Note that `data` is a getter and setter option. If you just require
			 * formatting of data for output, you will likely want to use `render` which
			 * is simply a getter and thus simpler to use.
			 *
			 * Note that prior to DataTables 1.9.2 `data` was called `mDataProp`. The
			 * name change reflects the flexibility of this property and is consistent
			 * with the naming of mRender. If 'mDataProp' is given, then it will still
			 * be used by DataTables, as it automatically maps the old name to the new
			 * if required.
			 *
			 *  @type string|int|function|null
			 *  @default null <i>Use automatically calculated column index</i>
			 *
			 *  @name DataTable.defaults.column.data
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Read table data from objects
			 *    // JSON structure for each row:
			 *    //   {
			 *    //      "engine": {value},
			 *    //      "browser": {value},
			 *    //      "platform": {value},
			 *    //      "version": {value},
			 *    //      "grade": {value}
			 *    //   }
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "ajaxSource": "sources/objects.txt",
			 *        "columns": [
			 *          { "data": "engine" },
			 *          { "data": "browser" },
			 *          { "data": "platform" },
			 *          { "data": "version" },
			 *          { "data": "grade" }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Read information from deeply nested objects
			 *    // JSON structure for each row:
			 *    //   {
			 *    //      "engine": {value},
			 *    //      "browser": {value},
			 *    //      "platform": {
			 *    //         "inner": {value}
			 *    //      },
			 *    //      "details": [
			 *    //         {value}, {value}
			 *    //      ]
			 *    //   }
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "ajaxSource": "sources/deep.txt",
			 *        "columns": [
			 *          { "data": "engine" },
			 *          { "data": "browser" },
			 *          { "data": "platform.inner" },
			 *          { "data": "details.0" },
			 *          { "data": "details.1" }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `data` as a function to provide different information for
			 *    // sorting, filtering and display. In this case, currency (price)
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "data": function ( source, type, val ) {
			 *            if (type === 'set') {
			 *              source.price = val;
			 *              // Store the computed display and filter values for efficiency
			 *              source.price_display = val=="" ? "" : "$"+numberFormat(val);
			 *              source.price_filter  = val=="" ? "" : "$"+numberFormat(val)+" "+val;
			 *              return;
			 *            }
			 *            else if (type === 'display') {
			 *              return source.price_display;
			 *            }
			 *            else if (type === 'filter') {
			 *              return source.price_filter;
			 *            }
			 *            // 'sort', 'type' and undefined all just use the integer
			 *            return source.price;
			 *          }
			 *        } ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using default content
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "data": null,
			 *          "defaultContent": "Click to edit"
			 *        } ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using array notation - outputting a list from an array
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "data": "name[, ]"
			 *        } ]
			 *      } );
			 *    } );
			 *
			 */
			"mData": null,


			/**
			 * This property is the rendering partner to `data` and it is suggested that
			 * when you want to manipulate data for display (including filtering,
			 * sorting etc) without altering the underlying data for the table, use this
			 * property. `render` can be considered to be the the read only companion to
			 * `data` which is read / write (then as such more complex). Like `data`
			 * this option can be given in a number of different ways to effect its
			 * behaviour:
			 *
			 * * `integer` - treated as an array index for the data source. This is the
			 *   default that DataTables uses (incrementally increased for each column).
			 * * `string` - read an object property from the data source. There are
			 *   three 'special' options that can be used in the string to alter how
			 *   DataTables reads the data from the source object:
			 *    * `.` - Dotted Javascript notation. Just as you use a `.` in
			 *      Javascript to read from nested objects, so to can the options
			 *      specified in `data`. For example: `browser.version` or
			 *      `browser.name`. If your object parameter name contains a period, use
			 *      `\\` to escape it - i.e. `first\\.name`.
			 *    * `[]` - Array notation. DataTables can automatically combine data
			 *      from and array source, joining the data with the characters provided
			 *      between the two brackets. For example: `name[, ]` would provide a
			 *      comma-space separated list from the source array. If no characters
			 *      are provided between the brackets, the original array source is
			 *      returned.
			 *    * `()` - Function notation. Adding `()` to the end of a parameter will
			 *      execute a function of the name given. For example: `browser()` for a
			 *      simple function on the data source, `browser.version()` for a
			 *      function in a nested property or even `browser().version` to get an
			 *      object property if the function called returns an object.
			 * * `object` - use different data for the different data types requested by
			 *   DataTables ('filter', 'display', 'type' or 'sort'). The property names
			 *   of the object is the data type the property refers to and the value can
			 *   defined using an integer, string or function using the same rules as
			 *   `render` normally does. Note that an `_` option _must_ be specified.
			 *   This is the default value to use if you haven't specified a value for
			 *   the data type requested by DataTables.
			 * * `function` - the function given will be executed whenever DataTables
			 *   needs to set or get the data for a cell in the column. The function
			 *   takes three parameters:
			 *    * Parameters:
			 *      * {array|object} The data source for the row (based on `data`)
			 *      * {string} The type call data requested - this will be 'filter',
			 *        'display', 'type' or 'sort'.
			 *      * {array|object} The full data source for the row (not based on
			 *        `data`)
			 *    * Return:
			 *      * The return value from the function is what will be used for the
			 *        data requested.
			 *
			 *  @type string|int|function|object|null
			 *  @default null Use the data source value.
			 *
			 *  @name DataTable.defaults.column.render
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Create a comma separated list from an array of objects
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "ajaxSource": "sources/deep.txt",
			 *        "columns": [
			 *          { "data": "engine" },
			 *          { "data": "browser" },
			 *          {
			 *            "data": "platform",
			 *            "render": "[, ].name"
			 *          }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Execute a function to obtain data
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "data": null, // Use the full data source object for the renderer's source
			 *          "render": "browserName()"
			 *        } ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // As an object, extracting different data for the different types
			 *    // This would be used with a data source such as:
			 *    //   { "phone": 5552368, "phone_filter": "5552368 555-2368", "phone_display": "555-2368" }
			 *    // Here the `phone` integer is used for sorting and type detection, while `phone_filter`
			 *    // (which has both forms) is used for filtering for if a user inputs either format, while
			 *    // the formatted phone number is the one that is shown in the table.
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "data": null, // Use the full data source object for the renderer's source
			 *          "render": {
			 *            "_": "phone",
			 *            "filter": "phone_filter",
			 *            "display": "phone_display"
			 *          }
			 *        } ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Use as a function to create a link from the data source
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "data": "download_link",
			 *          "render": function ( data, type, full ) {
			 *            return '<a href="'+data+'">Download</a>';
			 *          }
			 *        } ]
			 *      } );
			 *    } );
			 */
			"mRender": null,


			/**
			 * Change the cell type created for the column - either TD cells or TH cells. This
			 * can be useful as TH cells have semantic meaning in the table body, allowing them
			 * to act as a header for a row (you may wish to add scope='row' to the TH elements).
			 *  @type string
			 *  @default td
			 *
			 *  @name DataTable.defaults.column.cellType
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Make the first column use TH cells
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [ {
			 *          "targets": [ 0 ],
			 *          "cellType": "th"
			 *        } ]
			 *      } );
			 *    } );
			 */
			"sCellType": "td",


			/**
			 * Class to give to each cell in this column.
			 *  @type string
			 *  @default <i>Empty string</i>
			 *
			 *  @name DataTable.defaults.column.class
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "class": "my_class", "targets": [ 0 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "class": "my_class" },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ]
			 *      } );
			 *    } );
			 */
			"sClass": "",

			/**
			 * When DataTables calculates the column widths to assign to each column,
			 * it finds the longest string in each column and then constructs a
			 * temporary table and reads the widths from that. The problem with this
			 * is that "mmm" is much wider then "iiii", but the latter is a longer
			 * string - thus the calculation can go wrong (doing it properly and putting
			 * it into an DOM object and measuring that is horribly(!) slow). Thus as
			 * a "work around" we provide this option. It will append its value to the
			 * text that is found to be the longest string for the column - i.e. padding.
			 * Generally you shouldn't need this!
			 *  @type string
			 *  @default <i>Empty string<i>
			 *
			 *  @name DataTable.defaults.column.contentPadding
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          null,
			 *          null,
			 *          null,
			 *          {
			 *            "contentPadding": "mmm"
			 *          }
			 *        ]
			 *      } );
			 *    } );
			 */
			"sContentPadding": "",


			/**
			 * Allows a default value to be given for a column's data, and will be used
			 * whenever a null data source is encountered (this can be because `data`
			 * is set to null, or because the data source itself is null).
			 *  @type string
			 *  @default null
			 *
			 *  @name DataTable.defaults.column.defaultContent
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          {
			 *            "data": null,
			 *            "defaultContent": "Edit",
			 *            "targets": [ -1 ]
			 *          }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          null,
			 *          null,
			 *          null,
			 *          {
			 *            "data": null,
			 *            "defaultContent": "Edit"
			 *          }
			 *        ]
			 *      } );
			 *    } );
			 */
			"sDefaultContent": null,


			/**
			 * This parameter is only used in DataTables' server-side processing. It can
			 * be exceptionally useful to know what columns are being displayed on the
			 * client side, and to map these to database fields. When defined, the names
			 * also allow DataTables to reorder information from the server if it comes
			 * back in an unexpected order (i.e. if you switch your columns around on the
			 * client-side, your server-side code does not also need updating).
			 *  @type string
			 *  @default <i>Empty string</i>
			 *
			 *  @name DataTable.defaults.column.name
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "name": "engine", "targets": [ 0 ] },
			 *          { "name": "browser", "targets": [ 1 ] },
			 *          { "name": "platform", "targets": [ 2 ] },
			 *          { "name": "version", "targets": [ 3 ] },
			 *          { "name": "grade", "targets": [ 4 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "name": "engine" },
			 *          { "name": "browser" },
			 *          { "name": "platform" },
			 *          { "name": "version" },
			 *          { "name": "grade" }
			 *        ]
			 *      } );
			 *    } );
			 */
			"sName": "",


			/**
			 * Defines a data source type for the ordering which can be used to read
			 * real-time information from the table (updating the internally cached
			 * version) prior to ordering. This allows ordering to occur on user
			 * editable elements such as form inputs.
			 *  @type string
			 *  @default std
			 *
			 *  @name DataTable.defaults.column.orderDataType
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "orderDataType": "dom-text", "targets": [ 2, 3 ] },
			 *          { "type": "numeric", "targets": [ 3 ] },
			 *          { "orderDataType": "dom-select", "targets": [ 4 ] },
			 *          { "orderDataType": "dom-checkbox", "targets": [ 5 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          null,
			 *          null,
			 *          { "orderDataType": "dom-text" },
			 *          { "orderDataType": "dom-text", "type": "numeric" },
			 *          { "orderDataType": "dom-select" },
			 *          { "orderDataType": "dom-checkbox" }
			 *        ]
			 *      } );
			 *    } );
			 */
			"sSortDataType": "std",


			/**
			 * The title of this column.
			 *  @type string
			 *  @default null <i>Derived from the 'TH' value for this column in the
			 *    original HTML table.</i>
			 *
			 *  @name DataTable.defaults.column.title
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "title": "My column title", "targets": [ 0 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "title": "My column title" },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ]
			 *      } );
			 *    } );
			 */
			"sTitle": null,


			/**
			 * The type allows you to specify how the data for this column will be
			 * ordered. Four types (string, numeric, date and html (which will strip
			 * HTML tags before ordering)) are currently available. Note that only date
			 * formats understood by Javascript's Date() object will be accepted as type
			 * date. For example: "Mar 26, 2008 5:03 PM". May take the values: 'string',
			 * 'numeric', 'date' or 'html' (by default). Further types can be adding
			 * through plug-ins.
			 *  @type string
			 *  @default null <i>Auto-detected from raw data</i>
			 *
			 *  @name DataTable.defaults.column.type
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "type": "html", "targets": [ 0 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "type": "html" },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ]
			 *      } );
			 *    } );
			 */
			"sType": null,


			/**
			 * Defining the width of the column, this parameter may take any CSS value
			 * (3em, 20px etc). DataTables applies 'smart' widths to columns which have not
			 * been given a specific width through this interface ensuring that the table
			 * remains readable.
			 *  @type string
			 *  @default null <i>Automatic</i>
			 *
			 *  @name DataTable.defaults.column.width
			 *  @dtopt Columns
			 *
			 *  @example
			 *    // Using `columnDefs`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columnDefs": [
			 *          { "width": "20%", "targets": [ 0 ] }
			 *        ]
			 *      } );
			 *    } );
			 *
			 *  @example
			 *    // Using `columns`
			 *    $(document).ready( function() {
			 *      $('#example').dataTable( {
			 *        "columns": [
			 *          { "width": "20%" },
			 *          null,
			 *          null,
			 *          null,
			 *          null
			 *        ]
			 *      } );
			 *    } );
			 */
			"sWidth": null
		};

		_fnHungarianMap(DataTable.defaults.column);



		/**
		 * DataTables settings object - this holds all the information needed for a
		 * given table, including configuration, data and current application of the
		 * table options. DataTables does not have a single instance for each DataTable
		 * with the settings attached to that instance, but rather instances of the
		 * DataTable "class" are created on-the-fly as needed (typically by a
		 * $().dataTable() call) and the settings object is then applied to that
		 * instance.
		 *
		 * Note that this object is related to {@link DataTable.defaults} but this
		 * one is the internal data store for DataTables's cache of columns. It should
		 * NOT be manipulated outside of DataTables. Any configuration should be done
		 * through the initialisation options.
		 *  @namespace
		 *  @todo Really should attach the settings object to individual instances so we
		 *    don't need to create new instances on each $().dataTable() call (if the
		 *    table already exists). It would also save passing oSettings around and
		 *    into every single function. However, this is a very significant
		 *    architecture change for DataTables and will almost certainly break
		 *    backwards compatibility with older installations. This is something that
		 *    will be done in 2.0.
		 */
		DataTable.models.oSettings = {
			/**
			 * Primary features of DataTables and their enablement state.
			 *  @namespace
			 */
			"oFeatures": {

				/**
				 * Flag to say if DataTables should automatically try to calculate the
				 * optimum table and columns widths (true) or not (false).
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bAutoWidth": null,

				/**
				 * Delay the creation of TR and TD elements until they are actually
				 * needed by a driven page draw. This can give a significant speed
				 * increase for Ajax source and Javascript source data, but makes no
				 * difference at all for DOM and server-side processing tables.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bDeferRender": null,

				/**
				 * Enable filtering on the table or not. Note that if this is disabled
				 * then there is no filtering at all on the table, including fnFilter.
				 * To just remove the filtering input use sDom and remove the 'f' option.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bFilter": null,

				/**
				 * Table information element (the 'Showing x of y records' div) enable
				 * flag.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bInfo": null,

				/**
				 * Present a user control allowing the end user to change the page size
				 * when pagination is enabled.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bLengthChange": null,

				/**
				 * Pagination enabled or not. Note that if this is disabled then length
				 * changing must also be disabled.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bPaginate": null,

				/**
				 * Processing indicator enable flag whenever DataTables is enacting a
				 * user request - typically an Ajax request for server-side processing.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bProcessing": null,

				/**
				 * Server-side processing enabled flag - when enabled DataTables will
				 * get all data from the server for every draw - there is no filtering,
				 * sorting or paging done on the client-side.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bServerSide": null,

				/**
				 * Sorting enablement flag.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bSort": null,

				/**
				 * Multi-column sorting
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bSortMulti": null,

				/**
				 * Apply a class to the columns which are being sorted to provide a
				 * visual highlight or not. This can slow things down when enabled since
				 * there is a lot of DOM interaction.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bSortClasses": null,

				/**
				 * State saving enablement flag.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bStateSave": null
			},


			/**
			 * Scrolling settings for a table.
			 *  @namespace
			 */
			"oScroll": {
				/**
				 * When the table is shorter in height than sScrollY, collapse the
				 * table container down to the height of the table (when true).
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type boolean
				 */
				"bCollapse": null,

				/**
				 * Width of the scrollbar for the web-browser's platform. Calculated
				 * during table initialisation.
				 *  @type int
				 *  @default 0
				 */
				"iBarWidth": 0,

				/**
				 * Viewport width for horizontal scrolling. Horizontal scrolling is
				 * disabled if an empty string.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type string
				 */
				"sX": null,

				/**
				 * Width to expand the table to when using x-scrolling. Typically you
				 * should not need to use this.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type string
				 *  @deprecated
				 */
				"sXInner": null,

				/**
				 * Viewport height for vertical scrolling. Vertical scrolling is disabled
				 * if an empty string.
				 * Note that this parameter will be set by the initialisation routine. To
				 * set a default use {@link DataTable.defaults}.
				 *  @type string
				 */
				"sY": null
			},

			/**
			 * Language information for the table.
			 *  @namespace
			 *  @extends DataTable.defaults.oLanguage
			 */
			"oLanguage": {
				/**
				 * Information callback function. See
				 * {@link DataTable.defaults.fnInfoCallback}
				 *  @type function
				 *  @default null
				 */
				"fnInfoCallback": null
			},

			/**
			 * Browser support parameters
			 *  @namespace
			 */
			"oBrowser": {
				/**
				 * Indicate if the browser incorrectly calculates width:100% inside a
				 * scrolling element (IE6/7)
				 *  @type boolean
				 *  @default false
				 */
				"bScrollOversize": false,

				/**
				 * Determine if the vertical scrollbar is on the right or left of the
				 * scrolling container - needed for rtl language layout, although not
				 * all browsers move the scrollbar (Safari).
				 *  @type boolean
				 *  @default false
				 */
				"bScrollbarLeft": false,

				/**
				 * Flag for if `getBoundingClientRect` is fully supported or not
				 *  @type boolean
				 *  @default false
				 */
				"bBounding": false,

				/**
				 * Browser scrollbar width
				 *  @type integer
				 *  @default 0
				 */
				"barWidth": 0
			},


			"ajax": null,


			/**
			 * Array referencing the nodes which are used for the features. The
			 * parameters of this object match what is allowed by sDom - i.e.
			 *   <ul>
			 *     <li>'l' - Length changing</li>
			 *     <li>'f' - Filtering input</li>
			 *     <li>'t' - The table!</li>
			 *     <li>'i' - Information</li>
			 *     <li>'p' - Pagination</li>
			 *     <li>'r' - pRocessing</li>
			 *   </ul>
			 *  @type array
			 *  @default []
			 */
			"aanFeatures": [],

			/**
			 * Store data information - see {@link DataTable.models.oRow} for detailed
			 * information.
			 *  @type array
			 *  @default []
			 */
			"aoData": [],

			/**
			 * Array of indexes which are in the current display (after filtering etc)
			 *  @type array
			 *  @default []
			 */
			"aiDisplay": [],

			/**
			 * Array of indexes for display - no filtering
			 *  @type array
			 *  @default []
			 */
			"aiDisplayMaster": [],

			/**
			 * Map of row ids to data indexes
			 *  @type object
			 *  @default {}
			 */
			"aIds": {},

			/**
			 * Store information about each column that is in use
			 *  @type array
			 *  @default []
			 */
			"aoColumns": [],

			/**
			 * Store information about the table's header
			 *  @type array
			 *  @default []
			 */
			"aoHeader": [],

			/**
			 * Store information about the table's footer
			 *  @type array
			 *  @default []
			 */
			"aoFooter": [],

			/**
			 * Store the applied global search information in case we want to force a
			 * research or compare the old search to a new one.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @namespace
			 *  @extends DataTable.models.oSearch
			 */
			"oPreviousSearch": {},

			/**
			 * Store the applied search for each column - see
			 * {@link DataTable.models.oSearch} for the format that is used for the
			 * filtering information for each column.
			 *  @type array
			 *  @default []
			 */
			"aoPreSearchCols": [],

			/**
			 * Sorting that is applied to the table. Note that the inner arrays are
			 * used in the following manner:
			 * <ul>
			 *   <li>Index 0 - column number</li>
			 *   <li>Index 1 - current sorting direction</li>
			 * </ul>
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type array
			 *  @todo These inner arrays should really be objects
			 */
			"aaSorting": null,

			/**
			 * Sorting that is always applied to the table (i.e. prefixed in front of
			 * aaSorting).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type array
			 *  @default []
			 */
			"aaSortingFixed": [],

			/**
			 * Classes to use for the striping of a table.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type array
			 *  @default []
			 */
			"asStripeClasses": null,

			/**
			 * If restoring a table - we should restore its striping classes as well
			 *  @type array
			 *  @default []
			 */
			"asDestroyStripes": [],

			/**
			 * If restoring a table - we should restore its width
			 *  @type int
			 *  @default 0
			 */
			"sDestroyWidth": 0,

			/**
			 * Callback functions array for every time a row is inserted (i.e. on a draw).
			 *  @type array
			 *  @default []
			 */
			"aoRowCallback": [],

			/**
			 * Callback functions for the header on each draw.
			 *  @type array
			 *  @default []
			 */
			"aoHeaderCallback": [],

			/**
			 * Callback function for the footer on each draw.
			 *  @type array
			 *  @default []
			 */
			"aoFooterCallback": [],

			/**
			 * Array of callback functions for draw callback functions
			 *  @type array
			 *  @default []
			 */
			"aoDrawCallback": [],

			/**
			 * Array of callback functions for row created function
			 *  @type array
			 *  @default []
			 */
			"aoRowCreatedCallback": [],

			/**
			 * Callback functions for just before the table is redrawn. A return of
			 * false will be used to cancel the draw.
			 *  @type array
			 *  @default []
			 */
			"aoPreDrawCallback": [],

			/**
			 * Callback functions for when the table has been initialised.
			 *  @type array
			 *  @default []
			 */
			"aoInitComplete": [],


			/**
			 * Callbacks for modifying the settings to be stored for state saving, prior to
			 * saving state.
			 *  @type array
			 *  @default []
			 */
			"aoStateSaveParams": [],

			/**
			 * Callbacks for modifying the settings that have been stored for state saving
			 * prior to using the stored values to restore the state.
			 *  @type array
			 *  @default []
			 */
			"aoStateLoadParams": [],

			/**
			 * Callbacks for operating on the settings object once the saved state has been
			 * loaded
			 *  @type array
			 *  @default []
			 */
			"aoStateLoaded": [],

			/**
			 * Cache the table ID for quick access
			 *  @type string
			 *  @default <i>Empty string</i>
			 */
			"sTableId": "",

			/**
			 * The TABLE node for the main table
			 *  @type node
			 *  @default null
			 */
			"nTable": null,

			/**
			 * Permanent ref to the thead element
			 *  @type node
			 *  @default null
			 */
			"nTHead": null,

			/**
			 * Permanent ref to the tfoot element - if it exists
			 *  @type node
			 *  @default null
			 */
			"nTFoot": null,

			/**
			 * Permanent ref to the tbody element
			 *  @type node
			 *  @default null
			 */
			"nTBody": null,

			/**
			 * Cache the wrapper node (contains all DataTables controlled elements)
			 *  @type node
			 *  @default null
			 */
			"nTableWrapper": null,

			/**
			 * Indicate if when using server-side processing the loading of data
			 * should be deferred until the second draw.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 *  @default false
			 */
			"bDeferLoading": false,

			/**
			 * Indicate if all required information has been read in
			 *  @type boolean
			 *  @default false
			 */
			"bInitialised": false,

			/**
			 * Information about open rows. Each object in the array has the parameters
			 * 'nTr' and 'nParent'
			 *  @type array
			 *  @default []
			 */
			"aoOpenRows": [],

			/**
			 * Dictate the positioning of DataTables' control elements - see
			 * {@link DataTable.model.oInit.sDom}.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 *  @default null
			 */
			"sDom": null,

			/**
			 * Search delay (in mS)
			 *  @type integer
			 *  @default null
			 */
			"searchDelay": null,

			/**
			 * Which type of pagination should be used.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 *  @default two_button
			 */
			"sPaginationType": "two_button",

			/**
			 * The state duration (for `stateSave`) in seconds.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type int
			 *  @default 0
			 */
			"iStateDuration": 0,

			/**
			 * Array of callback functions for state saving. Each array element is an
			 * object with the following parameters:
			 *   <ul>
			 *     <li>function:fn - function to call. Takes two parameters, oSettings
			 *       and the JSON string to save that has been thus far created. Returns
			 *       a JSON string to be inserted into a json object
			 *       (i.e. '"param": [ 0, 1, 2]')</li>
			 *     <li>string:sName - name of callback</li>
			 *   </ul>
			 *  @type array
			 *  @default []
			 */
			"aoStateSave": [],

			/**
			 * Array of callback functions for state loading. Each array element is an
			 * object with the following parameters:
			 *   <ul>
			 *     <li>function:fn - function to call. Takes two parameters, oSettings
			 *       and the object stored. May return false to cancel state loading</li>
			 *     <li>string:sName - name of callback</li>
			 *   </ul>
			 *  @type array
			 *  @default []
			 */
			"aoStateLoad": [],

			/**
			 * State that was saved. Useful for back reference
			 *  @type object
			 *  @default null
			 */
			"oSavedState": null,

			/**
			 * State that was loaded. Useful for back reference
			 *  @type object
			 *  @default null
			 */
			"oLoadedState": null,

			/**
			 * Source url for AJAX data for the table.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 *  @default null
			 */
			"sAjaxSource": null,

			/**
			 * Property from a given object from which to read the table data from. This
			 * can be an empty string (when not server-side processing), in which case
			 * it is  assumed an an array is given directly.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 */
			"sAjaxDataProp": null,

			/**
			 * The last jQuery XHR object that was used for server-side data gathering.
			 * This can be used for working with the XHR information in one of the
			 * callbacks
			 *  @type object
			 *  @default null
			 */
			"jqXHR": null,

			/**
			 * JSON returned from the server in the last Ajax request
			 *  @type object
			 *  @default undefined
			 */
			"json": undefined,

			/**
			 * Data submitted as part of the last Ajax request
			 *  @type object
			 *  @default undefined
			 */
			"oAjaxData": undefined,

			/**
			 * Function to get the server-side data.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type function
			 */
			"fnServerData": null,

			/**
			 * Functions which are called prior to sending an Ajax request so extra
			 * parameters can easily be sent to the server
			 *  @type array
			 *  @default []
			 */
			"aoServerParams": [],

			/**
			 * Send the XHR HTTP method - GET or POST (could be PUT or DELETE if
			 * required).
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type string
			 */
			"sServerMethod": null,

			/**
			 * Format numbers for display.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type function
			 */
			"fnFormatNumber": null,

			/**
			 * List of options that can be used for the user selectable length menu.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type array
			 *  @default []
			 */
			"aLengthMenu": null,

			/**
			 * Counter for the draws that the table does. Also used as a tracker for
			 * server-side processing
			 *  @type int
			 *  @default 0
			 */
			"iDraw": 0,

			/**
			 * Indicate if a redraw is being done - useful for Ajax
			 *  @type boolean
			 *  @default false
			 */
			"bDrawing": false,

			/**
			 * Draw index (iDraw) of the last error when parsing the returned data
			 *  @type int
			 *  @default -1
			 */
			"iDrawError": -1,

			/**
			 * Paging display length
			 *  @type int
			 *  @default 10
			 */
			"_iDisplayLength": 10,

			/**
			 * Paging start point - aiDisplay index
			 *  @type int
			 *  @default 0
			 */
			"_iDisplayStart": 0,

			/**
			 * Server-side processing - number of records in the result set
			 * (i.e. before filtering), Use fnRecordsTotal rather than
			 * this property to get the value of the number of records, regardless of
			 * the server-side processing setting.
			 *  @type int
			 *  @default 0
			 *  @private
			 */
			"_iRecordsTotal": 0,

			/**
			 * Server-side processing - number of records in the current display set
			 * (i.e. after filtering). Use fnRecordsDisplay rather than
			 * this property to get the value of the number of records, regardless of
			 * the server-side processing setting.
			 *  @type boolean
			 *  @default 0
			 *  @private
			 */
			"_iRecordsDisplay": 0,

			/**
			 * The classes to use for the table
			 *  @type object
			 *  @default {}
			 */
			"oClasses": {},

			/**
			 * Flag attached to the settings object so you can check in the draw
			 * callback if filtering has been done in the draw. Deprecated in favour of
			 * events.
			 *  @type boolean
			 *  @default false
			 *  @deprecated
			 */
			"bFiltered": false,

			/**
			 * Flag attached to the settings object so you can check in the draw
			 * callback if sorting has been done in the draw. Deprecated in favour of
			 * events.
			 *  @type boolean
			 *  @default false
			 *  @deprecated
			 */
			"bSorted": false,

			/**
			 * Indicate that if multiple rows are in the header and there is more than
			 * one unique cell per column, if the top one (true) or bottom one (false)
			 * should be used for sorting / title by DataTables.
			 * Note that this parameter will be set by the initialisation routine. To
			 * set a default use {@link DataTable.defaults}.
			 *  @type boolean
			 */
			"bSortCellsTop": null,

			/**
			 * Initialisation object that is used for the table
			 *  @type object
			 *  @default null
			 */
			"oInit": null,

			/**
			 * Destroy callback functions - for plug-ins to attach themselves to the
			 * destroy so they can clean up markup and events.
			 *  @type array
			 *  @default []
			 */
			"aoDestroyCallback": [],


			/**
			 * Get the number of records in the current record set, before filtering
			 *  @type function
			 */
			"fnRecordsTotal": function () {
				return _fnDataSource(this) == 'ssp' ?
					this._iRecordsTotal * 1 :
					this.aiDisplayMaster.length;
			},

			/**
			 * Get the number of records in the current record set, after filtering
			 *  @type function
			 */
			"fnRecordsDisplay": function () {
				return _fnDataSource(this) == 'ssp' ?
					this._iRecordsDisplay * 1 :
					this.aiDisplay.length;
			},

			/**
			 * Get the display end point - aiDisplay index
			 *  @type function
			 */
			"fnDisplayEnd": function () {
				var
					len = this._iDisplayLength,
					start = this._iDisplayStart,
					calc = start + len,
					records = this.aiDisplay.length,
					features = this.oFeatures,
					paginate = features.bPaginate;

				if (features.bServerSide) {
					return paginate === false || len === -1 ?
						start + records :
						Math.min(start + len, this._iRecordsDisplay);
				}
				else {
					return !paginate || calc > records || len === -1 ?
						records :
						calc;
				}
			},

			/**
			 * The DataTables object for this table
			 *  @type object
			 *  @default null
			 */
			"oInstance": null,

			/**
			 * Unique identifier for each instance of the DataTables object. If there
			 * is an ID on the table node, then it takes that value, otherwise an
			 * incrementing internal counter is used.
			 *  @type string
			 *  @default null
			 */
			"sInstance": null,

			/**
			 * tabindex attribute value that is added to DataTables control elements, allowing
			 * keyboard navigation of the table and its controls.
			 */
			"iTabIndex": 0,

			/**
			 * DIV container for the footer scrolling table if scrolling
			 */
			"nScrollHead": null,

			/**
			 * DIV container for the footer scrolling table if scrolling
			 */
			"nScrollFoot": null,

			/**
			 * Last applied sort
			 *  @type array
			 *  @default []
			 */
			"aLastSort": [],

			/**
			 * Stored plug-in instances
			 *  @type object
			 *  @default {}
			 */
			"oPlugins": {},

			/**
			 * Function used to get a row's id from the row's data
			 *  @type function
			 *  @default null
			 */
			"rowIdFn": null,

			/**
			 * Data location where to store a row's id
			 *  @type string
			 *  @default null
			 */
			"rowId": null
		};

		/**
		 * Extension object for DataTables that is used to provide all extension
		 * options.
		 *
		 * Note that the `DataTable.ext` object is available through
		 * `jQuery.fn.dataTable.ext` where it may be accessed and manipulated. It is
		 * also aliased to `jQuery.fn.dataTableExt` for historic reasons.
		 *  @namespace
		 *  @extends DataTable.models.ext
		 */


		/**
		 * DataTables extensions
		 * 
		 * This namespace acts as a collection area for plug-ins that can be used to
		 * extend DataTables capabilities. Indeed many of the build in methods
		 * use this method to provide their own capabilities (sorting methods for
		 * example).
		 *
		 * Note that this namespace is aliased to `jQuery.fn.dataTableExt` for legacy
		 * reasons
		 *
		 *  @namespace
		 */
		DataTable.ext = _ext = {
			/**
			 * Buttons. For use with the Buttons extension for DataTables. This is
			 * defined here so other extensions can define buttons regardless of load
			 * order. It is _not_ used by DataTables core.
			 *
			 *  @type object
			 *  @default {}
			 */
			buttons: {},


			/**
			 * Element class names
			 *
			 *  @type object
			 *  @default {}
			 */
			classes: {},


			/**
			 * DataTables build type (expanded by the download builder)
			 *
			 *  @type string
			 */
			builder: "-source-",


			/**
			 * Error reporting.
			 * 
			 * How should DataTables report an error. Can take the value 'alert',
			 * 'throw', 'none' or a function.
			 *
			 *  @type string|function
			 *  @default alert
			 */
			errMode: "alert",


			/**
			 * Feature plug-ins.
			 * 
			 * This is an array of objects which describe the feature plug-ins that are
			 * available to DataTables. These feature plug-ins are then available for
			 * use through the `dom` initialisation option.
			 * 
			 * Each feature plug-in is described by an object which must have the
			 * following properties:
			 * 
			 * * `fnInit` - function that is used to initialise the plug-in,
			 * * `cFeature` - a character so the feature can be enabled by the `dom`
			 *   instillation option. This is case sensitive.
			 *
			 * The `fnInit` function has the following input parameters:
			 *
			 * 1. `{object}` DataTables settings object: see
			 *    {@link DataTable.models.oSettings}
			 *
			 * And the following return is expected:
			 * 
			 * * {node|null} The element which contains your feature. Note that the
			 *   return may also be void if your plug-in does not require to inject any
			 *   DOM elements into DataTables control (`dom`) - for example this might
			 *   be useful when developing a plug-in which allows table control via
			 *   keyboard entry
			 *
			 *  @type array
			 *
			 *  @example
			 *    $.fn.dataTable.ext.features.push( {
			 *      "fnInit": function( oSettings ) {
			 *        return new TableTools( { "oDTSettings": oSettings } );
			 *      },
			 *      "cFeature": "T"
			 *    } );
			 */
			feature: [],


			/**
			 * Row searching.
			 * 
			 * This method of searching is complimentary to the default type based
			 * searching, and a lot more comprehensive as it allows you complete control
			 * over the searching logic. Each element in this array is a function
			 * (parameters described below) that is called for every row in the table,
			 * and your logic decides if it should be included in the searching data set
			 * or not.
			 *
			 * Searching functions have the following input parameters:
			 *
			 * 1. `{object}` DataTables settings object: see
			 *    {@link DataTable.models.oSettings}
			 * 2. `{array|object}` Data for the row to be processed (same as the
			 *    original format that was passed in as the data source, or an array
			 *    from a DOM data source
			 * 3. `{int}` Row index ({@link DataTable.models.oSettings.aoData}), which
			 *    can be useful to retrieve the `TR` element if you need DOM interaction.
			 *
			 * And the following return is expected:
			 *
			 * * {boolean} Include the row in the searched result set (true) or not
			 *   (false)
			 *
			 * Note that as with the main search ability in DataTables, technically this
			 * is "filtering", since it is subtractive. However, for consistency in
			 * naming we call it searching here.
			 *
			 *  @type array
			 *  @default []
			 *
			 *  @example
			 *    // The following example shows custom search being applied to the
			 *    // fourth column (i.e. the data[3] index) based on two input values
			 *    // from the end-user, matching the data in a certain range.
			 *    $.fn.dataTable.ext.search.push(
			 *      function( settings, data, dataIndex ) {
			 *        var min = document.getElementById('min').value * 1;
			 *        var max = document.getElementById('max').value * 1;
			 *        var version = data[3] == "-" ? 0 : data[3]*1;
			 *
			 *        if ( min == "" && max == "" ) {
			 *          return true;
			 *        }
			 *        else if ( min == "" && version < max ) {
			 *          return true;
			 *        }
			 *        else if ( min < version && "" == max ) {
			 *          return true;
			 *        }
			 *        else if ( min < version && version < max ) {
			 *          return true;
			 *        }
			 *        return false;
			 *      }
			 *    );
			 */
			search: [],


			/**
			 * Selector extensions
			 *
			 * The `selector` option can be used to extend the options available for the
			 * selector modifier options (`selector-modifier` object data type) that
			 * each of the three built in selector types offer (row, column and cell +
			 * their plural counterparts). For example the Select extension uses this
			 * mechanism to provide an option to select only rows, columns and cells
			 * that have been marked as selected by the end user (`{selected: true}`),
			 * which can be used in conjunction with the existing built in selector
			 * options.
			 *
			 * Each property is an array to which functions can be pushed. The functions
			 * take three attributes:
			 *
			 * * Settings object for the host table
			 * * Options object (`selector-modifier` object type)
			 * * Array of selected item indexes
			 *
			 * The return is an array of the resulting item indexes after the custom
			 * selector has been applied.
			 *
			 *  @type object
			 */
			selector: {
				cell: [],
				column: [],
				row: []
			},


			/**
			 * Internal functions, exposed for used in plug-ins.
			 * 
			 * Please note that you should not need to use the internal methods for
			 * anything other than a plug-in (and even then, try to avoid if possible).
			 * The internal function may change between releases.
			 *
			 *  @type object
			 *  @default {}
			 */
			internal: {},


			/**
			 * Legacy configuration options. Enable and disable legacy options that
			 * are available in DataTables.
			 *
			 *  @type object
			 */
			legacy: {
				/**
				 * Enable / disable DataTables 1.9 compatible server-side processing
				 * requests
				 *
				 *  @type boolean
				 *  @default null
				 */
				ajax: null
			},


			/**
			 * Pagination plug-in methods.
			 * 
			 * Each entry in this object is a function and defines which buttons should
			 * be shown by the pagination rendering method that is used for the table:
			 * {@link DataTable.ext.renderer.pageButton}. The renderer addresses how the
			 * buttons are displayed in the document, while the functions here tell it
			 * what buttons to display. This is done by returning an array of button
			 * descriptions (what each button will do).
			 *
			 * Pagination types (the four built in options and any additional plug-in
			 * options defined here) can be used through the `paginationType`
			 * initialisation parameter.
			 *
			 * The functions defined take two parameters:
			 *
			 * 1. `{int} page` The current page index
			 * 2. `{int} pages` The number of pages in the table
			 *
			 * Each function is expected to return an array where each element of the
			 * array can be one of:
			 *
			 * * `first` - Jump to first page when activated
			 * * `last` - Jump to last page when activated
			 * * `previous` - Show previous page when activated
			 * * `next` - Show next page when activated
			 * * `{int}` - Show page of the index given
			 * * `{array}` - A nested array containing the above elements to add a
			 *   containing 'DIV' element (might be useful for styling).
			 *
			 * Note that DataTables v1.9- used this object slightly differently whereby
			 * an object with two functions would be defined for each plug-in. That
			 * ability is still supported by DataTables 1.10+ to provide backwards
			 * compatibility, but this option of use is now decremented and no longer
			 * documented in DataTables 1.10+.
			 *
			 *  @type object
			 *  @default {}
			 *
			 *  @example
			 *    // Show previous, next and current page buttons only
			 *    $.fn.dataTableExt.oPagination.current = function ( page, pages ) {
			 *      return [ 'previous', page, 'next' ];
			 *    };
			 */
			pager: {},


			renderer: {
				pageButton: {},
				header: {}
			},


			/**
			 * Ordering plug-ins - custom data source
			 * 
			 * The extension options for ordering of data available here is complimentary
			 * to the default type based ordering that DataTables typically uses. It
			 * allows much greater control over the the data that is being used to
			 * order a column, but is necessarily therefore more complex.
			 * 
			 * This type of ordering is useful if you want to do ordering based on data
			 * live from the DOM (for example the contents of an 'input' element) rather
			 * than just the static string that DataTables knows of.
			 * 
			 * The way these plug-ins work is that you create an array of the values you
			 * wish to be ordering for the column in question and then return that
			 * array. The data in the array much be in the index order of the rows in
			 * the table (not the currently ordering order!). Which order data gathering
			 * function is run here depends on the `dt-init columns.orderDataType`
			 * parameter that is used for the column (if any).
			 *
			 * The functions defined take two parameters:
			 *
			 * 1. `{object}` DataTables settings object: see
			 *    {@link DataTable.models.oSettings}
			 * 2. `{int}` Target column index
			 *
			 * Each function is expected to return an array:
			 *
			 * * `{array}` Data for the column to be ordering upon
			 *
			 *  @type array
			 *
			 *  @example
			 *    // Ordering using `input` node values
			 *    $.fn.dataTable.ext.order['dom-text'] = function  ( settings, col )
			 *    {
			 *      return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
			 *        return $('input', td).val();
			 *      } );
			 *    }
			 */
			order: {},


			/**
			 * Type based plug-ins.
			 *
			 * Each column in DataTables has a type assigned to it, either by automatic
			 * detection or by direct assignment using the `type` option for the column.
			 * The type of a column will effect how it is ordering and search (plug-ins
			 * can also make use of the column type if required).
			 *
			 * @namespace
			 */
			type: {
				/**
				 * Type detection functions.
				 *
				 * The functions defined in this object are used to automatically detect
				 * a column's type, making initialisation of DataTables super easy, even
				 * when complex data is in the table.
				 *
				 * The functions defined take two parameters:
				 *
				 *  1. `{*}` Data from the column cell to be analysed
				 *  2. `{settings}` DataTables settings object. This can be used to
				 *     perform context specific type detection - for example detection
				 *     based on language settings such as using a comma for a decimal
				 *     place. Generally speaking the options from the settings will not
				 *     be required
				 *
				 * Each function is expected to return:
				 *
				 * * `{string|null}` Data type detected, or null if unknown (and thus
				 *   pass it on to the other type detection functions.
				 *
				 *  @type array
				 *
				 *  @example
				 *    // Currency type detection plug-in:
				 *    $.fn.dataTable.ext.type.detect.push(
				 *      function ( data, settings ) {
				 *        // Check the numeric part
				 *        if ( ! data.substring(1).match(/[0-9]/) ) {
				 *          return null;
				 *        }
				 *
				 *        // Check prefixed by currency
				 *        if ( data.charAt(0) == '$' || data.charAt(0) == '&pound;' ) {
				 *          return 'currency';
				 *        }
				 *        return null;
				 *      }
				 *    );
				 */
				detect: [],


				/**
				 * Type based search formatting.
				 *
				 * The type based searching functions can be used to pre-format the
				 * data to be search on. For example, it can be used to strip HTML
				 * tags or to de-format telephone numbers for numeric only searching.
				 *
				 * Note that is a search is not defined for a column of a given type,
				 * no search formatting will be performed.
				 * 
				 * Pre-processing of searching data plug-ins - When you assign the sType
				 * for a column (or have it automatically detected for you by DataTables
				 * or a type detection plug-in), you will typically be using this for
				 * custom sorting, but it can also be used to provide custom searching
				 * by allowing you to pre-processing the data and returning the data in
				 * the format that should be searched upon. This is done by adding
				 * functions this object with a parameter name which matches the sType
				 * for that target column. This is the corollary of <i>afnSortData</i>
				 * for searching data.
				 *
				 * The functions defined take a single parameter:
				 *
				 *  1. `{*}` Data from the column cell to be prepared for searching
				 *
				 * Each function is expected to return:
				 *
				 * * `{string|null}` Formatted string that will be used for the searching.
				 *
				 *  @type object
				 *  @default {}
				 *
				 *  @example
				 *    $.fn.dataTable.ext.type.search['title-numeric'] = function ( d ) {
				 *      return d.replace(/\n/g," ").replace( /<.*?>/g, "" );
				 *    }
				 */
				search: {},


				/**
				 * Type based ordering.
				 *
				 * The column type tells DataTables what ordering to apply to the table
				 * when a column is sorted upon. The order for each type that is defined,
				 * is defined by the functions available in this object.
				 *
				 * Each ordering option can be described by three properties added to
				 * this object:
				 *
				 * * `{type}-pre` - Pre-formatting function
				 * * `{type}-asc` - Ascending order function
				 * * `{type}-desc` - Descending order function
				 *
				 * All three can be used together, only `{type}-pre` or only
				 * `{type}-asc` and `{type}-desc` together. It is generally recommended
				 * that only `{type}-pre` is used, as this provides the optimal
				 * implementation in terms of speed, although the others are provided
				 * for compatibility with existing Javascript sort functions.
				 *
				 * `{type}-pre`: Functions defined take a single parameter:
				 *
				 *  1. `{*}` Data from the column cell to be prepared for ordering
				 *
				 * And return:
				 *
				 * * `{*}` Data to be sorted upon
				 *
				 * `{type}-asc` and `{type}-desc`: Functions are typical Javascript sort
				 * functions, taking two parameters:
				 *
				 *  1. `{*}` Data to compare to the second parameter
				 *  2. `{*}` Data to compare to the first parameter
				 *
				 * And returning:
				 *
				 * * `{*}` Ordering match: <0 if first parameter should be sorted lower
				 *   than the second parameter, ===0 if the two parameters are equal and
				 *   >0 if the first parameter should be sorted height than the second
				 *   parameter.
				 * 
				 *  @type object
				 *  @default {}
				 *
				 *  @example
				 *    // Numeric ordering of formatted numbers with a pre-formatter
				 *    $.extend( $.fn.dataTable.ext.type.order, {
				 *      "string-pre": function(x) {
				 *        a = (a === "-" || a === "") ? 0 : a.replace( /[^\d\-\.]/g, "" );
				 *        return parseFloat( a );
				 *      }
				 *    } );
				 *
				 *  @example
				 *    // Case-sensitive string ordering, with no pre-formatting method
				 *    $.extend( $.fn.dataTable.ext.order, {
				 *      "string-case-asc": function(x,y) {
				 *        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
				 *      },
				 *      "string-case-desc": function(x,y) {
				 *        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
				 *      }
				 *    } );
				 */
				order: {}
			},

			/**
			 * Unique DataTables instance counter
			 *
			 * @type int
			 * @private
			 */
			_unique: 0,


			//
			// Depreciated
			// The following properties are retained for backwards compatibility only.
			// The should not be used in new projects and will be removed in a future
			// version
			//

			/**
			 * Version check function.
			 *  @type function
			 *  @depreciated Since 1.10
			 */
			fnVersionCheck: DataTable.fnVersionCheck,


			/**
			 * Index for what 'this' index API functions should use
			 *  @type int
			 *  @deprecated Since v1.10
			 */
			iApiIndex: 0,


			/**
			 * jQuery UI class container
			 *  @type object
			 *  @deprecated Since v1.10
			 */
			oJUIClasses: {},


			/**
			 * Software version
			 *  @type string
			 *  @deprecated Since v1.10
			 */
			sVersion: DataTable.version
		};


		//
		// Backwards compatibility. Alias to pre 1.10 Hungarian notation counter parts
		//
		$.extend(_ext, {
			afnFiltering: _ext.search,
			aTypes: _ext.type.detect,
			ofnSearch: _ext.type.search,
			oSort: _ext.type.order,
			afnSortData: _ext.order,
			aoFeatures: _ext.feature,
			oApi: _ext.internal,
			oStdClasses: _ext.classes,
			oPagination: _ext.pager
		});


		$.extend(DataTable.ext.classes, {
			"sTable": "dataTable",
			"sNoFooter": "no-footer",

			/* Paging buttons */
			"sPageButton": "paginate_button",
			"sPageButtonActive": "current",
			"sPageButtonDisabled": "disabled",

			/* Striping classes */
			"sStripeOdd": "odd",
			"sStripeEven": "even",

			/* Empty row */
			"sRowEmpty": "dataTables_empty",

			/* Features */
			"sWrapper": "dataTables_wrapper",
			"sFilter": "dataTables_filter",
			"sInfo": "dataTables_info",
			"sPaging": "dataTables_paginate paging_", /* Note that the type is postfixed */
			"sLength": "dataTables_length",
			"sProcessing": "dataTables_processing",

			/* Sorting */
			"sSortAsc": "sorting_asc",
			"sSortDesc": "sorting_desc",
			"sSortable": "sorting", /* Sortable in both directions */
			"sSortableAsc": "sorting_desc_disabled",
			"sSortableDesc": "sorting_asc_disabled",
			"sSortableNone": "sorting_disabled",
			"sSortColumn": "sorting_", /* Note that an int is postfixed for the sorting order */

			/* Filtering */
			"sFilterInput": "",

			/* Page length */
			"sLengthSelect": "",

			/* Scrolling */
			"sScrollWrapper": "dataTables_scroll",
			"sScrollHead": "dataTables_scrollHead",
			"sScrollHeadInner": "dataTables_scrollHeadInner",
			"sScrollBody": "dataTables_scrollBody",
			"sScrollFoot": "dataTables_scrollFoot",
			"sScrollFootInner": "dataTables_scrollFootInner",

			/* Misc */
			"sHeaderTH": "",
			"sFooterTH": "",

			// Deprecated
			"sSortJUIAsc": "",
			"sSortJUIDesc": "",
			"sSortJUI": "",
			"sSortJUIAscAllowed": "",
			"sSortJUIDescAllowed": "",
			"sSortJUIWrapper": "",
			"sSortIcon": "",
			"sJUIHeader": "",
			"sJUIFooter": ""
		});


		var extPagination = DataTable.ext.pager;

		function _numbers(page, pages) {
			var
				numbers = [],
				buttons = extPagination.numbers_length,
				half = Math.floor(buttons / 2),
				i = 1;

			if (pages <= buttons) {
				numbers = _range(0, pages);
			}
			else if (page <= half) {
				numbers = _range(0, buttons - 2);
				numbers.push('ellipsis');
				numbers.push(pages - 1);
			}
			else if (page >= pages - 1 - half) {
				numbers = _range(pages - (buttons - 2), pages);
				numbers.splice(0, 0, 'ellipsis'); // no unshift in ie6
				numbers.splice(0, 0, 0);
			}
			else {
				numbers = _range(page - half + 2, page + half - 1);
				numbers.push('ellipsis');
				numbers.push(pages - 1);
				numbers.splice(0, 0, 'ellipsis');
				numbers.splice(0, 0, 0);
			}

			numbers.DT_el = 'span';
			return numbers;
		}


		$.extend(extPagination, {
			simple: function (page, pages) {
				return ['previous', 'next'];
			},

			full: function (page, pages) {
				return ['first', 'previous', 'next', 'last'];
			},

			numbers: function (page, pages) {
				return [_numbers(page, pages)];
			},

			simple_numbers: function (page, pages) {
				return ['previous', _numbers(page, pages), 'next'];
			},

			full_numbers: function (page, pages) {
				return ['first', 'previous', _numbers(page, pages), 'next', 'last'];
			},

			first_last_numbers: function (page, pages) {
				return ['first', _numbers(page, pages), 'last'];
			},

			// For testing and plug-ins to use
			_numbers: _numbers,

			// Number of number buttons (including ellipsis) to show. _Must be odd!_
			numbers_length: 7
		});


		$.extend(true, DataTable.ext.renderer, {
			pageButton: {
				_: function (settings, host, idx, buttons, page, pages) {
					var classes = settings.oClasses;
					var lang = settings.oLanguage.oPaginate;
					var aria = settings.oLanguage.oAria.paginate || {};
					var btnDisplay, btnClass;

					var attach = function (container, buttons) {
						var i, ien, node, button, tabIndex;
						var disabledClass = classes.sPageButtonDisabled;
						var clickHandler = function (e) {
							_fnPageChange(settings, e.data.action, true);
						};

						for (i = 0, ien = buttons.length; i < ien; i++) {
							button = buttons[i];

							if (Array.isArray(button)) {
								var inner = $('<' + (button.DT_el || 'div') + '/>')
									.appendTo(container);
								attach(inner, button);
							}
							else {
								btnDisplay = null;
								btnClass = button;
								tabIndex = settings.iTabIndex;

								switch (button) {
									case 'ellipsis':
										container.append('<span class="ellipsis">&#x2026;</span>');
										break;

									case 'first':
										btnDisplay = lang.sFirst;

										if (page === 0) {
											tabIndex = -1;
											btnClass += ' ' + disabledClass;
										}
										break;

									case 'previous':
										btnDisplay = lang.sPrevious;

										if (page === 0) {
											tabIndex = -1;
											btnClass += ' ' + disabledClass;
										}
										break;

									case 'next':
										btnDisplay = lang.sNext;

										if (pages === 0 || page === pages - 1) {
											tabIndex = -1;
											btnClass += ' ' + disabledClass;
										}
										break;

									case 'last':
										btnDisplay = lang.sLast;

										if (pages === 0 || page === pages - 1) {
											tabIndex = -1;
											btnClass += ' ' + disabledClass;
										}
										break;

									default:
										btnDisplay = settings.fnFormatNumber(button + 1);
										btnClass = page === button ?
											classes.sPageButtonActive : '';
										break;
								}

								if (btnDisplay !== null) {
									var tag = settings.oInit.pagingTag || 'a';
									var disabled = btnClass.indexOf(disabledClass) !== -1;


									node = $('<' + tag + '>', {
										'class': classes.sPageButton + ' ' + btnClass,
										'aria-controls': settings.sTableId,
										'aria-disabled': disabled ? 'true' : null,
										'aria-label': aria[button],
										'aria-role': 'link',
										'aria-current': btnClass === classes.sPageButtonActive ? 'page' : null,
										'data-dt-idx': button,
										'tabindex': tabIndex,
										'id': idx === 0 && typeof button === 'string' ?
											settings.sTableId + '_' + button :
											null
									})
										.html(btnDisplay)
										.appendTo(container);

									_fnBindAction(
										node, { action: button }, clickHandler
									);
								}
							}
						}
					};

					// IE9 throws an 'unknown error' if document.activeElement is used
					// inside an iframe or frame. Try / catch the error. Not good for
					// accessibility, but neither are frames.
					var activeEl;

					try {
						// Because this approach is destroying and recreating the paging
						// elements, focus is lost on the select button which is bad for
						// accessibility. So we want to restore focus once the draw has
						// completed
						activeEl = $(host).find(document.activeElement).data('dt-idx');
					}
					catch (e) { }

					attach($(host).empty(), buttons);

					if (activeEl !== undefined) {
						$(host).find('[data-dt-idx=' + activeEl + ']').trigger('focus');
					}
				}
			}
		});



		// Built in type detection. See model.ext.aTypes for information about
		// what is required from this methods.
		$.extend(DataTable.ext.type.detect, [
			// Plain numbers - first since V8 detects some plain numbers as dates
			// e.g. Date.parse('55') (but not all, e.g. Date.parse('22')...).
			function (d, settings) {
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber(d, decimal) ? 'num' + decimal : null;
			},

			// Dates (only those recognised by the browser's Date.parse)
			function (d, settings) {
				// V8 tries _very_ hard to make a string passed into `Date.parse()`
				// valid, so we need to use a regex to restrict date formats. Use a
				// plug-in for anything other than ISO8601 style strings
				if (d && !(d instanceof Date) && !_re_date.test(d)) {
					return null;
				}
				var parsed = Date.parse(d);
				return (parsed !== null && !isNaN(parsed)) || _empty(d) ? 'date' : null;
			},

			// Formatted numbers
			function (d, settings) {
				var decimal = settings.oLanguage.sDecimal;
				return _isNumber(d, decimal, true) ? 'num-fmt' + decimal : null;
			},

			// HTML numeric
			function (d, settings) {
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric(d, decimal) ? 'html-num' + decimal : null;
			},

			// HTML numeric, formatted
			function (d, settings) {
				var decimal = settings.oLanguage.sDecimal;
				return _htmlNumeric(d, decimal, true) ? 'html-num-fmt' + decimal : null;
			},

			// HTML (this is strict checking - there must be html)
			function (d, settings) {
				return _empty(d) || (typeof d === 'string' && d.indexOf('<') !== -1) ?
					'html' : null;
			}
		]);



		// Filter formatting functions. See model.ext.ofnSearch for information about
		// what is required from these methods.
		// 
		// Note that additional search methods are added for the html numbers and
		// html formatted numbers by `_addNumericSort()` when we know what the decimal
		// place is


		$.extend(DataTable.ext.type.search, {
			html: function (data) {
				return _empty(data) ?
					data :
					typeof data === 'string' ?
						data
							.replace(_re_new_lines, " ")
							.replace(_re_html, "") :
						'';
			},

			string: function (data) {
				return _empty(data) ?
					data :
					typeof data === 'string' ?
						data.replace(_re_new_lines, " ") :
						data;
			}
		});



		var __numericReplace = function (d, decimalPlace, re1, re2) {
			if (d !== 0 && (!d || d === '-')) {
				return -Infinity;
			}

			let type = typeof d;

			if (type === 'number' || type === 'bigint') {
				return d;
			}

			// If a decimal place other than `.` is used, it needs to be given to the
			// function so we can detect it and replace with a `.` which is the only
			// decimal place Javascript recognises - it is not locale aware.
			if (decimalPlace) {
				d = _numToDecimal(d, decimalPlace);
			}

			if (d.replace) {
				if (re1) {
					d = d.replace(re1, '');
				}

				if (re2) {
					d = d.replace(re2, '');
				}
			}

			return d * 1;
		};


		// Add the numeric 'deformatting' functions for sorting and search. This is done
		// in a function to provide an easy ability for the language options to add
		// additional methods if a non-period decimal place is used.
		function _addNumericSort(decimalPlace) {
			$.each(
				{
					// Plain numbers
					"num": function (d) {
						return __numericReplace(d, decimalPlace);
					},

					// Formatted numbers
					"num-fmt": function (d) {
						return __numericReplace(d, decimalPlace, _re_formatted_numeric);
					},

					// HTML numeric
					"html-num": function (d) {
						return __numericReplace(d, decimalPlace, _re_html);
					},

					// HTML numeric, formatted
					"html-num-fmt": function (d) {
						return __numericReplace(d, decimalPlace, _re_html, _re_formatted_numeric);
					}
				},
				function (key, fn) {
					// Add the ordering method
					_ext.type.order[key + decimalPlace + '-pre'] = fn;

					// For HTML types add a search formatter that will strip the HTML
					if (key.match(/^html\-/)) {
						_ext.type.search[key + decimalPlace] = _ext.type.search.html;
					}
				}
			);
		}


		// Default sort methods
		$.extend(_ext.type.order, {
			// Dates
			"date-pre": function (d) {
				var ts = Date.parse(d);
				return isNaN(ts) ? -Infinity : ts;
			},

			// html
			"html-pre": function (a) {
				return _empty(a) ?
					'' :
					a.replace ?
						a.replace(/<.*?>/g, "").toLowerCase() :
						a + '';
			},

			// string
			"string-pre": function (a) {
				// This is a little complex, but faster than always calling toString,
				// http://jsperf.com/tostring-v-check
				return _empty(a) ?
					'' :
					typeof a === 'string' ?
						a.toLowerCase() :
						!a.toString ?
							'' :
							a.toString();
			},

			// string-asc and -desc are retained only for compatibility with the old
			// sort methods
			"string-asc": function (x, y) {
				return ((x < y) ? -1 : ((x > y) ? 1 : 0));
			},

			"string-desc": function (x, y) {
				return ((x < y) ? 1 : ((x > y) ? -1 : 0));
			}
		});


		// Numeric sorting types - order doesn't matter here
		_addNumericSort('');


		$.extend(true, DataTable.ext.renderer, {
			header: {
				_: function (settings, cell, column, classes) {
					// No additional mark-up required
					// Attach a sort listener to update on sort - note that using the
					// `DT` namespace will allow the event to be removed automatically
					// on destroy, while the `dt` namespaced event is the one we are
					// listening for
					$(settings.nTable).on('order.dt.DT', function (e, ctx, sorting, columns) {
						if (settings !== ctx) { // need to check this this is the host
							return;               // table, not a nested one
						}

						var colIdx = column.idx;

						cell
							.removeClass(
								classes.sSortAsc + ' ' +
								classes.sSortDesc
							)
							.addClass(columns[colIdx] == 'asc' ?
								classes.sSortAsc : columns[colIdx] == 'desc' ?
									classes.sSortDesc :
									column.sSortingClass
							);
					});
				},

				jqueryui: function (settings, cell, column, classes) {
					$('<div/>')
						.addClass(classes.sSortJUIWrapper)
						.append(cell.contents())
						.append($('<span/>')
							.addClass(classes.sSortIcon + ' ' + column.sSortingClassJUI)
						)
						.appendTo(cell);

					// Attach a sort listener to update on sort
					$(settings.nTable).on('order.dt.DT', function (e, ctx, sorting, columns) {
						if (settings !== ctx) {
							return;
						}

						var colIdx = column.idx;

						cell
							.removeClass(classes.sSortAsc + " " + classes.sSortDesc)
							.addClass(columns[colIdx] == 'asc' ?
								classes.sSortAsc : columns[colIdx] == 'desc' ?
									classes.sSortDesc :
									column.sSortingClass
							);

						cell
							.find('span.' + classes.sSortIcon)
							.removeClass(
								classes.sSortJUIAsc + " " +
								classes.sSortJUIDesc + " " +
								classes.sSortJUI + " " +
								classes.sSortJUIAscAllowed + " " +
								classes.sSortJUIDescAllowed
							)
							.addClass(columns[colIdx] == 'asc' ?
								classes.sSortJUIAsc : columns[colIdx] == 'desc' ?
									classes.sSortJUIDesc :
									column.sSortingClassJUI
							);
					});
				}
			}
		});

		/*
		 * Public helper functions. These aren't used internally by DataTables, or
		 * called by any of the options passed into DataTables, but they can be used
		 * externally by developers working with DataTables. They are helper functions
		 * to make working with DataTables a little bit easier.
		 */

		var __htmlEscapeEntities = function (d) {
			if (Array.isArray(d)) {
				d = d.join(',');
			}

			return typeof d === 'string' ?
				d
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;')
					.replace(/"/g, '&quot;') :
				d;
		};

		// Common logic for moment, luxon or a date action
		function __mld(dt, momentFn, luxonFn, dateFn, arg1) {
			if (window.moment) {
				return dt[momentFn](arg1);
			}
			else if (window.luxon) {
				return dt[luxonFn](arg1);
			}

			return dateFn ? dt[dateFn](arg1) : dt;
		}


		var __mlWarning = false;
		function __mldObj(d, format, locale) {
			var dt;

			if (window.moment) {
				dt = window.moment.utc(d, format, locale, true);

				if (!dt.isValid()) {
					return null;
				}
			}
			else if (window.luxon) {
				dt = format && typeof d === 'string'
					? window.luxon.DateTime.fromFormat(d, format)
					: window.luxon.DateTime.fromISO(d);

				if (!dt.isValid) {
					return null;
				}

				dt.setLocale(locale);
			}
			else if (!format) {
				// No format given, must be ISO
				dt = new Date(d);
			}
			else {
				if (!__mlWarning) {
					alert('DataTables warning: Formatted date without Moment.js or Luxon - https://datatables.net/tn/17');
				}

				__mlWarning = true;
			}

			return dt;
		}

		// Wrapper for date, datetime and time which all operate the same way with the exception of
		// the output string for auto locale support
		function __mlHelper(localeString) {
			return function (from, to, locale, def) {
				// Luxon and Moment support
				// Argument shifting
				if (arguments.length === 0) {
					locale = 'en';
					to = null; // means toLocaleString
					from = null; // means iso8601
				}
				else if (arguments.length === 1) {
					locale = 'en';
					to = from;
					from = null;
				}
				else if (arguments.length === 2) {
					locale = to;
					to = from;
					from = null;
				}

				var typeName = 'datetime-' + to;

				// Add type detection and sorting specific to this date format - we need to be able to identify
				// date type columns as such, rather than as numbers in extensions. Hence the need for this.
				if (!DataTable.ext.type.order[typeName]) {
					// The renderer will give the value to type detect as the type!
					DataTable.ext.type.detect.unshift(function (d) {
						return d === typeName ? typeName : false;
					});

					// The renderer gives us Moment, Luxon or Date obects for the sorting, all of which have a
					// `valueOf` which gives milliseconds epoch
					DataTable.ext.type.order[typeName + '-asc'] = function (a, b) {
						var x = a.valueOf();
						var y = b.valueOf();

						return x === y
							? 0
							: x < y
								? -1
								: 1;
					}

					DataTable.ext.type.order[typeName + '-desc'] = function (a, b) {
						var x = a.valueOf();
						var y = b.valueOf();

						return x === y
							? 0
							: x > y
								? -1
								: 1;
					}
				}

				return function (d, type) {
					// Allow for a default value
					if (d === null || d === undefined) {
						if (def === '--now') {
							// We treat everything as UTC further down, so no changes are
							// made, as such need to get the local date / time as if it were
							// UTC
							var local = new Date();
							d = new Date(Date.UTC(
								local.getFullYear(), local.getMonth(), local.getDate(),
								local.getHours(), local.getMinutes(), local.getSeconds()
							));
						}
						else {
							d = '';
						}
					}

					if (type === 'type') {
						// Typing uses the type name for fast matching
						return typeName;
					}

					if (d === '') {
						return type !== 'sort'
							? ''
							: __mldObj('0000-01-01 00:00:00', null, locale);
					}

					// Shortcut. If `from` and `to` are the same, we are using the renderer to
					// format for ordering, not display - its already in the display format.
					if (to !== null && from === to && type !== 'sort' && type !== 'type' && !(d instanceof Date)) {
						return d;
					}

					var dt = __mldObj(d, from, locale);

					if (dt === null) {
						return d;
					}

					if (type === 'sort') {
						return dt;
					}

					var formatted = to === null
						? __mld(dt, 'toDate', 'toJSDate', '')[localeString]()
						: __mld(dt, 'format', 'toFormat', 'toISOString', to);

					// XSS protection
					return type === 'display' ?
						__htmlEscapeEntities(formatted) :
						formatted;
				};
			}
		}

		// Based on locale, determine standard number formatting
		// Fallback for legacy browsers is US English
		var __thousands = ',';
		var __decimal = '.';

		if (Intl) {
			try {
				var num = new Intl.NumberFormat().formatToParts(100000.1);

				for (var i = 0; i < num.length; i++) {
					if (num[i].type === 'group') {
						__thousands = num[i].value;
					}
					else if (num[i].type === 'decimal') {
						__decimal = num[i].value;
					}
				}
			}
			catch (e) {
				// noop
			}
		}

		// Formatted date time detection - use by declaring the formats you are going to use
		DataTable.datetime = function (format, locale) {
			var typeName = 'datetime-detect-' + format;

			if (!locale) {
				locale = 'en';
			}

			if (!DataTable.ext.type.order[typeName]) {
				DataTable.ext.type.detect.unshift(function (d) {
					var dt = __mldObj(d, format, locale);
					return d === '' || dt ? typeName : false;
				});

				DataTable.ext.type.order[typeName + '-pre'] = function (d) {
					return __mldObj(d, format, locale) || 0;
				}
			}
		}

		/**
		 * Helpers for `columns.render`.
		 *
		 * The options defined here can be used with the `columns.render` initialisation
		 * option to provide a display renderer. The following functions are defined:
		 *
		 * * `number` - Will format numeric data (defined by `columns.data`) for
		 *   display, retaining the original unformatted data for sorting and filtering.
		 *   It takes 5 parameters:
		 *   * `string` - Thousands grouping separator
		 *   * `string` - Decimal point indicator
		 *   * `integer` - Number of decimal points to show
		 *   * `string` (optional) - Prefix.
		 *   * `string` (optional) - Postfix (/suffix).
		 * * `text` - Escape HTML to help prevent XSS attacks. It has no optional
		 *   parameters.
		 *
		 * @example
		 *   // Column definition using the number renderer
		 *   {
		 *     data: "salary",
		 *     render: $.fn.dataTable.render.number( '\'', '.', 0, '$' )
		 *   }
		 *
		 * @namespace
		 */
		DataTable.render = {
			date: __mlHelper('toLocaleDateString'),
			datetime: __mlHelper('toLocaleString'),
			time: __mlHelper('toLocaleTimeString'),
			number: function (thousands, decimal, precision, prefix, postfix) {
				// Auto locale detection
				if (thousands === null || thousands === undefined) {
					thousands = __thousands;
				}

				if (decimal === null || decimal === undefined) {
					decimal = __decimal;
				}

				return {
					display: function (d) {
						if (typeof d !== 'number' && typeof d !== 'string') {
							return d;
						}

						if (d === '' || d === null) {
							return d;
						}

						var negative = d < 0 ? '-' : '';
						var flo = parseFloat(d);

						// If NaN then there isn't much formatting that we can do - just
						// return immediately, escaping any HTML (this was supposed to
						// be a number after all)
						if (isNaN(flo)) {
							return __htmlEscapeEntities(d);
						}

						flo = flo.toFixed(precision);
						d = Math.abs(flo);

						var intPart = parseInt(d, 10);
						var floatPart = precision ?
							decimal + (d - intPart).toFixed(precision).substring(2) :
							'';

						// If zero, then can't have a negative prefix
						if (intPart === 0 && parseFloat(floatPart) === 0) {
							negative = '';
						}

						return negative + (prefix || '') +
							intPart.toString().replace(
								/\B(?=(\d{3})+(?!\d))/g, thousands
							) +
							floatPart +
							(postfix || '');
					}
				};
			},

			text: function () {
				return {
					display: __htmlEscapeEntities,
					filter: __htmlEscapeEntities
				};
			}
		};


		/*
		 * This is really a good bit rubbish this method of exposing the internal methods
		 * publicly... - To be fixed in 2.0 using methods on the prototype
		 */


		/**
		 * Create a wrapper function for exporting an internal functions to an external API.
		 *  @param {string} fn API function name
		 *  @returns {function} wrapped function
		 *  @memberof DataTable#internal
		 */
		function _fnExternApiFunc(fn) {
			return function () {
				var args = [_fnSettingsFromNode(this[DataTable.ext.iApiIndex])].concat(
					Array.prototype.slice.call(arguments)
				);
				return DataTable.ext.internal[fn].apply(this, args);
			};
		}


		/**
		 * Reference to internal functions for use by plug-in developers. Note that
		 * these methods are references to internal functions and are considered to be
		 * private. If you use these methods, be aware that they are liable to change
		 * between versions.
		 *  @namespace
		 */
		$.extend(DataTable.ext.internal, {
			_fnExternApiFunc: _fnExternApiFunc,
			_fnBuildAjax: _fnBuildAjax,
			_fnAjaxUpdate: _fnAjaxUpdate,
			_fnAjaxParameters: _fnAjaxParameters,
			_fnAjaxUpdateDraw: _fnAjaxUpdateDraw,
			_fnAjaxDataSrc: _fnAjaxDataSrc,
			_fnAddColumn: _fnAddColumn,
			_fnColumnOptions: _fnColumnOptions,
			_fnAdjustColumnSizing: _fnAdjustColumnSizing,
			_fnVisibleToColumnIndex: _fnVisibleToColumnIndex,
			_fnColumnIndexToVisible: _fnColumnIndexToVisible,
			_fnVisbleColumns: _fnVisbleColumns,
			_fnGetColumns: _fnGetColumns,
			_fnColumnTypes: _fnColumnTypes,
			_fnApplyColumnDefs: _fnApplyColumnDefs,
			_fnHungarianMap: _fnHungarianMap,
			_fnCamelToHungarian: _fnCamelToHungarian,
			_fnLanguageCompat: _fnLanguageCompat,
			_fnBrowserDetect: _fnBrowserDetect,
			_fnAddData: _fnAddData,
			_fnAddTr: _fnAddTr,
			_fnNodeToDataIndex: _fnNodeToDataIndex,
			_fnNodeToColumnIndex: _fnNodeToColumnIndex,
			_fnGetCellData: _fnGetCellData,
			_fnSetCellData: _fnSetCellData,
			_fnSplitObjNotation: _fnSplitObjNotation,
			_fnGetObjectDataFn: _fnGetObjectDataFn,
			_fnSetObjectDataFn: _fnSetObjectDataFn,
			_fnGetDataMaster: _fnGetDataMaster,
			_fnClearTable: _fnClearTable,
			_fnDeleteIndex: _fnDeleteIndex,
			_fnInvalidate: _fnInvalidate,
			_fnGetRowElements: _fnGetRowElements,
			_fnCreateTr: _fnCreateTr,
			_fnBuildHead: _fnBuildHead,
			_fnDrawHead: _fnDrawHead,
			_fnDraw: _fnDraw,
			_fnReDraw: _fnReDraw,
			_fnAddOptionsHtml: _fnAddOptionsHtml,
			_fnDetectHeader: _fnDetectHeader,
			_fnGetUniqueThs: _fnGetUniqueThs,
			_fnFeatureHtmlFilter: _fnFeatureHtmlFilter,
			_fnFilterComplete: _fnFilterComplete,
			_fnFilterCustom: _fnFilterCustom,
			_fnFilterColumn: _fnFilterColumn,
			_fnFilter: _fnFilter,
			_fnFilterCreateSearch: _fnFilterCreateSearch,
			_fnEscapeRegex: _fnEscapeRegex,
			_fnFilterData: _fnFilterData,
			_fnFeatureHtmlInfo: _fnFeatureHtmlInfo,
			_fnUpdateInfo: _fnUpdateInfo,
			_fnInfoMacros: _fnInfoMacros,
			_fnInitialise: _fnInitialise,
			_fnInitComplete: _fnInitComplete,
			_fnLengthChange: _fnLengthChange,
			_fnFeatureHtmlLength: _fnFeatureHtmlLength,
			_fnFeatureHtmlPaginate: _fnFeatureHtmlPaginate,
			_fnPageChange: _fnPageChange,
			_fnFeatureHtmlProcessing: _fnFeatureHtmlProcessing,
			_fnProcessingDisplay: _fnProcessingDisplay,
			_fnFeatureHtmlTable: _fnFeatureHtmlTable,
			_fnScrollDraw: _fnScrollDraw,
			_fnApplyToChildren: _fnApplyToChildren,
			_fnCalculateColumnWidths: _fnCalculateColumnWidths,
			_fnThrottle: _fnThrottle,
			_fnConvertToWidth: _fnConvertToWidth,
			_fnGetWidestNode: _fnGetWidestNode,
			_fnGetMaxLenString: _fnGetMaxLenString,
			_fnStringToCss: _fnStringToCss,
			_fnSortFlatten: _fnSortFlatten,
			_fnSort: _fnSort,
			_fnSortAria: _fnSortAria,
			_fnSortListener: _fnSortListener,
			_fnSortAttachListener: _fnSortAttachListener,
			_fnSortingClasses: _fnSortingClasses,
			_fnSortData: _fnSortData,
			_fnSaveState: _fnSaveState,
			_fnLoadState: _fnLoadState,
			_fnImplementState: _fnImplementState,
			_fnSettingsFromNode: _fnSettingsFromNode,
			_fnLog: _fnLog,
			_fnMap: _fnMap,
			_fnBindAction: _fnBindAction,
			_fnCallbackReg: _fnCallbackReg,
			_fnCallbackFire: _fnCallbackFire,
			_fnLengthOverflow: _fnLengthOverflow,
			_fnRenderer: _fnRenderer,
			_fnDataSource: _fnDataSource,
			_fnRowAttributes: _fnRowAttributes,
			_fnExtend: _fnExtend,
			_fnCalculateEnd: function () { } // Used by a lot of plug-ins, but redundant
			// in 1.10, so this dead-end function is
			// added to prevent errors
		});


		// jQuery access
		$.fn.dataTable = DataTable;

		// Provide access to the host jQuery object (circular reference)
		DataTable.$ = $;

		// Legacy aliases
		$.fn.dataTableSettings = DataTable.settings;
		$.fn.dataTableExt = DataTable.ext;

		// With a capital `D` we return a DataTables API instance rather than a
		// jQuery object
		$.fn.DataTable = function (opts) {
			return $(this).dataTable(opts).api();
		};

		// All properties that are available to $.fn.dataTable should also be
		// available on $.fn.DataTable
		$.each(DataTable, function (prop, val) {
			$.fn.DataTable[prop] = val;
		});

		return DataTable;
	}));

/*! DataTables Bootstrap 5 integration
 * 2020 SpryMedia Ltd - datatables.net/license
 */

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery', 'datatables.net'], function ($) {
			return factory($, window, document);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		module.exports = function (root, $) {
			if (!root) {
				// CommonJS environments without a window global must pass a
				// root. This will give an error otherwise
				root = window;
			}

			if (!$) {
				$ = typeof window !== 'undefined' ? // jQuery's factory checks for a global window
					require('jquery') :
					require('jquery')(root);
			}

			if (!$.fn.dataTable) {
				require('datatables.net')(root, $);
			}

			return factory($, root, root.document);
		};
	}
	else {
		// Browser
		factory(jQuery, window, document);
	}
}(function ($, window, document, undefined) {
	'use strict';
	var DataTable = $.fn.dataTable;



	/**
	 * DataTables integration for Bootstrap 5. This requires Bootstrap 5 and
	 * DataTables 1.10 or newer.
	 *
	 * This file sets the defaults and adds options to DataTables to style its
	 * controls using Bootstrap. See http://datatables.net/manual/styling/bootstrap
	 * for further information.
	 */

	/* Set the defaults for DataTables initialisation */
	$.extend(true, DataTable.defaults, {
		dom:
			"<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
			"<'row dt-row'<'col-sm-12'tr>>" +
			"<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",
		renderer: 'bootstrap'
	});


	/* Default class modification */
	$.extend(DataTable.ext.classes, {
		sWrapper: "dataTables_wrapper dt-bootstrap5",
		sFilterInput: "form-control form-control-sm",
		sLengthSelect: "form-select form-select-sm",
		sProcessing: "dataTables_processing card",
		sPageButton: "paginate_button page-item"
	});


	/* Bootstrap paging button renderer */
	DataTable.ext.renderer.pageButton.bootstrap = function (settings, host, idx, buttons, page, pages) {
		var api = new DataTable.Api(settings);
		var classes = settings.oClasses;
		var lang = settings.oLanguage.oPaginate;
		var aria = settings.oLanguage.oAria.paginate || {};
		var btnDisplay, btnClass;

		var attach = function (container, buttons) {
			var i, ien, node, button;
			var clickHandler = function (e) {
				e.preventDefault();
				if (!$(e.currentTarget).hasClass('disabled') && api.page() != e.data.action) {
					api.page(e.data.action).draw('page');
				}
			};

			for (i = 0, ien = buttons.length; i < ien; i++) {
				button = buttons[i];

				if (Array.isArray(button)) {
					attach(container, button);
				}
				else {
					btnDisplay = '';
					btnClass = '';

					switch (button) {
						case 'ellipsis':
							btnDisplay = '&#x2026;';
							btnClass = 'disabled';
							break;

						case 'first':
							btnDisplay = lang.sFirst;
							btnClass = button + (page > 0 ?
								'' : ' disabled');
							break;

						case 'previous':
							btnDisplay = lang.sPrevious;
							btnClass = button + (page > 0 ?
								'' : ' disabled');
							break;

						case 'next':
							btnDisplay = lang.sNext;
							btnClass = button + (page < pages - 1 ?
								'' : ' disabled');
							break;

						case 'last':
							btnDisplay = lang.sLast;
							btnClass = button + (page < pages - 1 ?
								'' : ' disabled');
							break;

						default:
							btnDisplay = button + 1;
							btnClass = page === button ?
								'active' : '';
							break;
					}

					if (btnDisplay) {
						var disabled = btnClass.indexOf('disabled') !== -1;

						node = $('<li>', {
							'class': classes.sPageButton + ' ' + btnClass,
							'id': idx === 0 && typeof button === 'string' ?
								settings.sTableId + '_' + button :
								null
						})
							.append($('<a>', {
								'href': disabled ? null : '#',
								'aria-controls': settings.sTableId,
								'aria-disabled': disabled ? 'true' : null,
								'aria-label': aria[button],
								'aria-role': 'link',
								'aria-current': btnClass === 'active' ? 'page' : null,
								'data-dt-idx': button,
								'tabindex': settings.iTabIndex,
								'class': 'page-link'
							})
								.html(btnDisplay)
							)
							.appendTo(container);

						settings.oApi._fnBindAction(
							node, { action: button }, clickHandler
						);
					}
				}
			}
		};

		var hostEl = $(host);
		// IE9 throws an 'unknown error' if document.activeElement is used
		// inside an iframe or frame. 
		var activeEl;

		try {
			// Because this approach is destroying and recreating the paging
			// elements, focus is lost on the select button which is bad for
			// accessibility. So we want to restore focus once the draw has
			// completed
			activeEl = hostEl.find(document.activeElement).data('dt-idx');
		}
		catch (e) { }

		var paginationEl = hostEl.children('ul.pagination');

		if (paginationEl.length) {
			paginationEl.empty();
		}
		else {
			paginationEl = hostEl.html('<ul/>').children('ul').addClass('pagination');
		}

		attach(
			paginationEl,
			buttons
		);

		if (activeEl !== undefined) {
			hostEl.find('[data-dt-idx=' + activeEl + ']').trigger('focus');
		}
	};


	return DataTable;
}));

"use strict";

//
// Datatables.net Initialization
//

// Set Defaults

var defaults = {
	"language": {
		"info": "Showing _START_ to _END_ of _TOTAL_ records",
		"infoEmpty": "Showing no records",
		"lengthMenu": "_MENU_",
		"processing": '<span class="spinner-border w-15px h-15px text-muted align-middle me-2"></span> <span class="text-gray-600">Loading...</span>',
		"paginate": {
			"first": '<i class="first"></i>',
			"last": '<i class="last"></i>',
			"next": '<i class="next"></i>',
			"previous": '<i class="previous"></i>'
		}
	}
};

$.extend(true, $.fn.dataTable.defaults, defaults);

/*! DataTables Bootstrap 4 integration
 * ©2011-2017 SpryMedia Ltd - datatables.net/license
 */

/**
 * DataTables integration for Bootstrap 4. This requires Bootstrap 4 and
 * DataTables 1.10 or newer.
 *
 * This file sets the defaults and adds options to DataTables to style its
 * controls using Bootstrap. See http://datatables.net/manual/styling/bootstrap
 * for further information.
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery', 'datatables.net'], function ($) {
			return factory($, window, document);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		module.exports = function (root, $) {
			if (!root) {
				root = window;
			}

			if (!$ || !$.fn.dataTable) {
				// Require DataTables, which attaches to jQuery, including
				// jQuery if needed and have a $ property so we can access the
				// jQuery object that is used
				$ = require('datatables.net')(root, $).$;
			}

			return factory($, root, root.document);
		};
	}
	else {
		// Browser
		factory(jQuery, window, document);
	}
}(function ($, window, document, undefined) {
	'use strict';
	var DataTable = $.fn.dataTable;


	/* Set the defaults for DataTables initialisation */
	$.extend(true, DataTable.defaults, {
		dom:
			"<'table-responsive'tr>" +

			"<'row'" +
			"<'col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start'li>" +
			"<'col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'p>" +
			">",

		renderer: 'bootstrap'
	});


	/* Default class modification */
	$.extend(DataTable.ext.classes, {
		sWrapper: "dataTables_wrapper dt-bootstrap4",
		sFilterInput: "form-control form-control-sm form-control-solid",
		sLengthSelect: "form-select form-select-sm form-select-solid",
		sProcessing: "dataTables_processing",
		sPageButton: "paginate_button page-item"
	});


	/* Bootstrap paging button renderer */
	DataTable.ext.renderer.pageButton.bootstrap = function (settings, host, idx, buttons, page, pages) {
		var api = new DataTable.Api(settings);
		var classes = settings.oClasses;
		var lang = settings.oLanguage.oPaginate;
		var aria = settings.oLanguage.oAria.paginate || {};
		var btnDisplay, btnClass, counter = 0;

		var attach = function (container, buttons) {
			var i, ien, node, button;
			var clickHandler = function (e) {
				e.preventDefault();
				if (!$(e.currentTarget).hasClass('disabled') && api.page() != e.data.action) {
					api.page(e.data.action).draw('page');
				}
			};

			for (i = 0, ien = buttons.length; i < ien; i++) {
				button = buttons[i];

				if (Array.isArray(button)) {
					attach(container, button);
				}
				else {
					btnDisplay = '';
					btnClass = '';

					switch (button) {
						case 'ellipsis':
							btnDisplay = '&#x2026;';
							btnClass = 'disabled';
							break;

						case 'first':
							btnDisplay = lang.sFirst;
							btnClass = button + (page > 0 ?
								'' : ' disabled');
							break;

						case 'previous':
							btnDisplay = lang.sPrevious;
							btnClass = button + (page > 0 ?
								'' : ' disabled');
							break;

						case 'next':
							btnDisplay = lang.sNext;
							btnClass = button + (page < pages - 1 ?
								'' : ' disabled');
							break;

						case 'last':
							btnDisplay = lang.sLast;
							btnClass = button + (page < pages - 1 ?
								'' : ' disabled');
							break;

						default:
							btnDisplay = button + 1;
							btnClass = page === button ?
								'active' : '';
							break;
					}

					if (btnDisplay) {
						node = $('<li>', {
							'class': classes.sPageButton + ' ' + btnClass,
							'id': idx === 0 && typeof button === 'string' ?
								settings.sTableId + '_' + button :
								null
						})
							.append($('<a>', {
								'href': '#',
								'aria-controls': settings.sTableId,
								'aria-label': aria[button],
								'data-dt-idx': counter,
								'tabindex': settings.iTabIndex,
								'class': 'page-link'
							})
								.html(btnDisplay)
							)
							.appendTo(container);

						settings.oApi._fnBindAction(
							node, { action: button }, clickHandler
						);

						counter++;
					}
				}
			}
		};

		// IE9 throws an 'unknown error' if document.activeElement is used
		// inside an iframe or frame.
		var activeEl;

		try {
			// Because this approach is destroying and recreating the paging
			// elements, focus is lost on the select button which is bad for
			// accessibility. So we want to restore focus once the draw has
			// completed
			activeEl = $(host).find(document.activeElement).data('dt-idx');
		}
		catch (e) { }

		attach(
			$(host).empty().html('<ul class="pagination"/>').children('ul'),
			buttons
		);

		if (activeEl !== undefined) {
			$(host).find('[data-dt-idx=' + activeEl + ']').trigger('focus');
		}
	};


	return DataTable;
}));

/*!

JSZip v3.10.1 - A JavaScript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/main/LICENSE
*/

!function (e) { if ("object" == typeof exports && "undefined" != typeof module) module.exports = e(); else if ("function" == typeof define && define.amd) define([], e); else { ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).JSZip = e() } }(function () { return function s(a, o, h) { function u(r, e) { if (!o[r]) { if (!a[r]) { var t = "function" == typeof require && require; if (!e && t) return t(r, !0); if (l) return l(r, !0); var n = new Error("Cannot find module '" + r + "'"); throw n.code = "MODULE_NOT_FOUND", n } var i = o[r] = { exports: {} }; a[r][0].call(i.exports, function (e) { var t = a[r][1][e]; return u(t || e) }, i, i.exports, s, a, o, h) } return o[r].exports } for (var l = "function" == typeof require && require, e = 0; e < h.length; e++)u(h[e]); return u }({ 1: [function (e, t, r) { "use strict"; var d = e("./utils"), c = e("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="; r.encode = function (e) { for (var t, r, n, i, s, a, o, h = [], u = 0, l = e.length, f = l, c = "string" !== d.getTypeOf(e); u < e.length;)f = l - u, n = c ? (t = e[u++], r = u < l ? e[u++] : 0, u < l ? e[u++] : 0) : (t = e.charCodeAt(u++), r = u < l ? e.charCodeAt(u++) : 0, u < l ? e.charCodeAt(u++) : 0), i = t >> 2, s = (3 & t) << 4 | r >> 4, a = 1 < f ? (15 & r) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h.push(p.charAt(i) + p.charAt(s) + p.charAt(a) + p.charAt(o)); return h.join("") }, r.decode = function (e) { var t, r, n, i, s, a, o = 0, h = 0, u = "data:"; if (e.substr(0, u.length) === u) throw new Error("Invalid base64 input, it looks like a data url."); var l, f = 3 * (e = e.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4; if (e.charAt(e.length - 1) === p.charAt(64) && f--, e.charAt(e.length - 2) === p.charAt(64) && f--, f % 1 != 0) throw new Error("Invalid base64 input, bad content length."); for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e.length;)t = p.indexOf(e.charAt(o++)) << 2 | (i = p.indexOf(e.charAt(o++))) >> 4, r = (15 & i) << 4 | (s = p.indexOf(e.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p.indexOf(e.charAt(o++))), l[h++] = t, 64 !== s && (l[h++] = r), 64 !== a && (l[h++] = n); return l } }, { "./support": 30, "./utils": 32 }], 2: [function (e, t, r) { "use strict"; var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe"); function o(e, t, r, n, i) { this.compressedSize = e, this.uncompressedSize = t, this.crc32 = r, this.compression = n, this.compressedContent = i } o.prototype = { getContentWorker: function () { var e = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t = this; return e.on("end", function () { if (this.streamInfo.data_length !== t.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch") }), e }, getCompressedWorker: function () { return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression) } }, o.createWorkerFrom = function (e, t, r) { return e.pipe(new s).pipe(new a("uncompressedSize")).pipe(t.compressWorker(r)).pipe(new a("compressedSize")).withStreamInfo("compression", t) }, t.exports = o }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function (e, t, r) { "use strict"; var n = e("./stream/GenericWorker"); r.STORE = { magic: "\0\0", compressWorker: function () { return new n("STORE compression") }, uncompressWorker: function () { return new n("STORE decompression") } }, r.DEFLATE = e("./flate") }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function (e, t, r) { "use strict"; var n = e("./utils"); var o = function () { for (var e, t = [], r = 0; r < 256; r++) { e = r; for (var n = 0; n < 8; n++)e = 1 & e ? 3988292384 ^ e >>> 1 : e >>> 1; t[r] = e } return t }(); t.exports = function (e, t) { return void 0 !== e && e.length ? "string" !== n.getTypeOf(e) ? function (e, t, r, n) { var i = o, s = n + r; e ^= -1; for (var a = n; a < s; a++)e = e >>> 8 ^ i[255 & (e ^ t[a])]; return -1 ^ e }(0 | t, e, e.length, 0) : function (e, t, r, n) { var i = o, s = n + r; e ^= -1; for (var a = n; a < s; a++)e = e >>> 8 ^ i[255 & (e ^ t.charCodeAt(a))]; return -1 ^ e }(0 | t, e, e.length, 0) : 0 } }, { "./utils": 32 }], 5: [function (e, t, r) { "use strict"; r.base64 = !1, r.binary = !1, r.dir = !1, r.createFolders = !0, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null }, {}], 6: [function (e, t, r) { "use strict"; var n = null; n = "undefined" != typeof Promise ? Promise : e("lie"), t.exports = { Promise: n } }, { lie: 37 }], 7: [function (e, t, r) { "use strict"; var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array"; function h(e, t) { a.call(this, "FlateWorker/" + e), this._pako = null, this._pakoAction = e, this._pakoOptions = t, this.meta = {} } r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function (e) { this.meta = e.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e.data), !1) }, h.prototype.flush = function () { a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], !0) }, h.prototype.cleanUp = function () { a.prototype.cleanUp.call(this), this._pako = null }, h.prototype._createPako = function () { this._pako = new i[this._pakoAction]({ raw: !0, level: this._pakoOptions.level || -1 }); var t = this; this._pako.onData = function (e) { t.push({ data: e, meta: t.meta }) } }, r.compressWorker = function (e) { return new h("Deflate", e) }, r.uncompressWorker = function () { return new h("Inflate", {}) } }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function (e, t, r) { "use strict"; function A(e, t) { var r, n = ""; for (r = 0; r < t; r++)n += String.fromCharCode(255 & e), e >>>= 8; return n } function n(e, t, r, n, i, s) { var a, o, h = e.file, u = e.compression, l = s !== O.utf8encode, f = I.transformTo("string", s(h.name)), c = I.transformTo("string", O.utf8encode(h.name)), d = h.comment, p = I.transformTo("string", s(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 }; t && !r || (x.crc32 = e.crc32, x.compressedSize = e.compressedSize, x.uncompressedSize = e.uncompressedSize); var S = 0; t && (S |= 8), l || !_ && !g || (S |= 2048); var z = 0, C = 0; w && (z |= 16), "UNIX" === i ? (C = 798, z |= function (e, t) { var r = e; return e || (r = t ? 16893 : 33204), (65535 & r) << 16 }(h.unixPermissions, w)) : (C = 20, z |= function (e) { return 63 & (e || 0) }(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y); var E = ""; return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(n, 4) + f + b + p } } var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature"); function s(e, t, r, n) { i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t, this.zipPlatform = r, this.encodeFileName = n, this.streamFiles = e, this.accumulate = !1, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [] } I.inherits(s, i), s.prototype.push = function (e) { var t = e.meta.percent || 0, r = this.entriesCount, n = this._sources.length; this.accumulate ? this.contentBuffer.push(e) : (this.bytesWritten += e.data.length, i.prototype.push.call(this, { data: e.data, meta: { currentFile: this.currentFile, percent: r ? (t + 100 * (r - n - 1)) / r : 100 } })) }, s.prototype.openedSource = function (e) { this.currentSourceOffset = this.bytesWritten, this.currentFile = e.file.name; var t = this.streamFiles && !e.file.dir; if (t) { var r = n(e, t, !1, this.currentSourceOffset, this.zipPlatform, this.encodeFileName); this.push({ data: r.fileRecord, meta: { percent: 0 } }) } else this.accumulate = !0 }, s.prototype.closedSource = function (e) { this.accumulate = !1; var t = this.streamFiles && !e.file.dir, r = n(e, t, !0, this.currentSourceOffset, this.zipPlatform, this.encodeFileName); if (this.dirRecords.push(r.dirRecord), t) this.push({ data: function (e) { return R.DATA_DESCRIPTOR + A(e.crc32, 4) + A(e.compressedSize, 4) + A(e.uncompressedSize, 4) }(e), meta: { percent: 100 } }); else for (this.push({ data: r.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length;)this.push(this.contentBuffer.shift()); this.currentFile = null }, s.prototype.flush = function () { for (var e = this.bytesWritten, t = 0; t < this.dirRecords.length; t++)this.push({ data: this.dirRecords[t], meta: { percent: 100 } }); var r = this.bytesWritten - e, n = function (e, t, r, n, i) { var s = I.transformTo("string", i(n)); return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e, 2) + A(e, 2) + A(t, 4) + A(r, 4) + A(s.length, 2) + s }(this.dirRecords.length, r, e, this.zipComment, this.encodeFileName); this.push({ data: n, meta: { percent: 100 } }) }, s.prototype.prepareNextSource = function () { this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume() }, s.prototype.registerPrevious = function (e) { this._sources.push(e); var t = this; return e.on("data", function (e) { t.processChunk(e) }), e.on("end", function () { t.closedSource(t.previous.streamInfo), t._sources.length ? t.prepareNextSource() : t.end() }), e.on("error", function (e) { t.error(e) }), this }, s.prototype.resume = function () { return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), !0) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), !0)) }, s.prototype.error = function (e) { var t = this._sources; if (!i.prototype.error.call(this, e)) return !1; for (var r = 0; r < t.length; r++)try { t[r].error(e) } catch (e) { } return !0 }, s.prototype.lock = function () { i.prototype.lock.call(this); for (var e = this._sources, t = 0; t < e.length; t++)e[t].lock() }, t.exports = s }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function (e, t, r) { "use strict"; var u = e("../compressions"), n = e("./ZipFileWorker"); r.generateWorker = function (e, a, t) { var o = new n(a.streamFiles, t, a.platform, a.encodeFileName), h = 0; try { e.forEach(function (e, t) { h++; var r = function (e, t) { var r = e || t, n = u[r]; if (!n) throw new Error(r + " is not a valid compression method !"); return n }(t.options.compression, a.compression), n = t.options.compressionOptions || a.compressionOptions || {}, i = t.dir, s = t.date; t._compressWorker(r, n).withStreamInfo("file", { name: e, dir: i, date: s, comment: t.comment || "", unixPermissions: t.unixPermissions, dosPermissions: t.dosPermissions }).pipe(o) }), o.entriesCount = h } catch (e) { o.error(e) } return o } }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function (e, t, r) { "use strict"; function n() { if (!(this instanceof n)) return new n; if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide."); this.files = Object.create(null), this.comment = null, this.root = "", this.clone = function () { var e = new n; for (var t in this) "function" != typeof this[t] && (e[t] = this[t]); return e } } (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.1", n.loadAsync = function (e, t) { return (new n).loadAsync(e, t) }, n.external = e("./external"), t.exports = n }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function (e, t, r) { "use strict"; var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils"); function f(n) { return new i.Promise(function (e, t) { var r = n.decompressed.getContentWorker().pipe(new a); r.on("error", function (e) { t(e) }).on("end", function () { r.streamInfo.crc32 !== n.decompressed.crc32 ? t(new Error("Corrupted zip : CRC32 mismatch")) : e() }).resume() }) } t.exports = function (e, o) { var h = this; return o = u.extend(o || {}, { base64: !1, checkCRC32: !1, optimizedBinaryString: !1, createFolders: !1, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e, !0, o.optimizedBinaryString, o.base64).then(function (e) { var t = new s(o); return t.load(e), t }).then(function (e) { var t = [i.Promise.resolve(e)], r = e.files; if (o.checkCRC32) for (var n = 0; n < r.length; n++)t.push(f(r[n])); return i.Promise.all(t) }).then(function (e) { for (var t = e.shift(), r = t.files, n = 0; n < r.length; n++) { var i = r[n], s = i.fileNameStr, a = u.resolve(i.fileNameStr); h.file(a, i.decompressed, { binary: !0, optimizedBinaryString: !0, date: i.date, dir: i.dir, comment: i.fileCommentStr.length ? i.fileCommentStr : null, unixPermissions: i.unixPermissions, dosPermissions: i.dosPermissions, createFolders: o.createFolders }), i.dir || (h.file(a).unsafeOriginalName = s) } return t.zipComment.length && (h.comment = t.zipComment), h }) } }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function (e, t, r) { "use strict"; var n = e("../utils"), i = e("../stream/GenericWorker"); function s(e, t) { i.call(this, "Nodejs stream input adapter for " + e), this._upstreamEnded = !1, this._bindStream(t) } n.inherits(s, i), s.prototype._bindStream = function (e) { var t = this; (this._stream = e).pause(), e.on("data", function (e) { t.push({ data: e, meta: { percent: 0 } }) }).on("error", function (e) { t.isPaused ? this.generatedError = e : t.error(e) }).on("end", function () { t.isPaused ? t._upstreamEnded = !0 : t.end() }) }, s.prototype.pause = function () { return !!i.prototype.pause.call(this) && (this._stream.pause(), !0) }, s.prototype.resume = function () { return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), !0) }, t.exports = s }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function (e, t, r) { "use strict"; var i = e("readable-stream").Readable; function n(e, t, r) { i.call(this, t), this._helper = e; var n = this; e.on("data", function (e, t) { n.push(e) || n._helper.pause(), r && r(t) }).on("error", function (e) { n.emit("error", e) }).on("end", function () { n.push(null) }) } e("../utils").inherits(n, i), n.prototype._read = function () { this._helper.resume() }, t.exports = n }, { "../utils": 32, "readable-stream": 16 }], 14: [function (e, t, r) { "use strict"; t.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function (e, t) { if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(e, t); if ("number" == typeof e) throw new Error('The "data" argument must not be a number'); return new Buffer(e, t) }, allocBuffer: function (e) { if (Buffer.alloc) return Buffer.alloc(e); var t = new Buffer(e); return t.fill(0), t }, isBuffer: function (e) { return Buffer.isBuffer(e) }, isStream: function (e) { return e && "function" == typeof e.on && "function" == typeof e.pause && "function" == typeof e.resume } } }, {}], 15: [function (e, t, r) { "use strict"; function s(e, t, r) { var n, i = u.getTypeOf(t), s = u.extend(r || {}, f); s.date = s.date || new Date, null !== s.compression && (s.compression = s.compression.toUpperCase()), "string" == typeof s.unixPermissions && (s.unixPermissions = parseInt(s.unixPermissions, 8)), s.unixPermissions && 16384 & s.unixPermissions && (s.dir = !0), s.dosPermissions && 16 & s.dosPermissions && (s.dir = !0), s.dir && (e = g(e)), s.createFolders && (n = _(e)) && b.call(this, n, !0); var a = "string" === i && !1 === s.binary && !1 === s.base64; r && void 0 !== r.binary || (s.binary = !a), (t instanceof c && 0 === t.uncompressedSize || s.dir || !t || 0 === t.length) && (s.base64 = !1, s.binary = !0, t = "", s.compression = "STORE", i = "string"); var o = null; o = t instanceof c || t instanceof l ? t : p.isNode && p.isStream(t) ? new m(e, t) : u.prepareContent(e, t, s.binary, s.optimizedBinaryString, s.base64); var h = new d(e, o, s); this.files[e] = h } var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = function (e) { "/" === e.slice(-1) && (e = e.substring(0, e.length - 1)); var t = e.lastIndexOf("/"); return 0 < t ? e.substring(0, t) : "" }, g = function (e) { return "/" !== e.slice(-1) && (e += "/"), e }, b = function (e, t) { return t = void 0 !== t ? t : f.createFolders, e = g(e), this.files[e] || s.call(this, e, null, { dir: !0, createFolders: t }), this.files[e] }; function h(e) { return "[object RegExp]" === Object.prototype.toString.call(e) } var n = { load: function () { throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.") }, forEach: function (e) { var t, r, n; for (t in this.files) n = this.files[t], (r = t.slice(this.root.length, t.length)) && t.slice(0, this.root.length) === this.root && e(r, n) }, filter: function (r) { var n = []; return this.forEach(function (e, t) { r(e, t) && n.push(t) }), n }, file: function (e, t, r) { if (1 !== arguments.length) return e = this.root + e, s.call(this, e, t, r), this; if (h(e)) { var n = e; return this.filter(function (e, t) { return !t.dir && n.test(e) }) } var i = this.files[this.root + e]; return i && !i.dir ? i : null }, folder: function (r) { if (!r) return this; if (h(r)) return this.filter(function (e, t) { return t.dir && r.test(e) }); var e = this.root + r, t = b.call(this, e), n = this.clone(); return n.root = t.name, n }, remove: function (r) { r = this.root + r; var e = this.files[r]; if (e || ("/" !== r.slice(-1) && (r += "/"), e = this.files[r]), e && !e.dir) delete this.files[r]; else for (var t = this.filter(function (e, t) { return t.name.slice(0, r.length) === r }), n = 0; n < t.length; n++)delete this.files[t[n].name]; return this }, generate: function () { throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.") }, generateInternalStream: function (e) { var t, r = {}; try { if ((r = u.extend(e || {}, { streamFiles: !1, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r.type.toLowerCase(), r.compression = r.compression.toUpperCase(), "binarystring" === r.type && (r.type = "string"), !r.type) throw new Error("No output type specified."); u.checkSupport(r.type), "darwin" !== r.platform && "freebsd" !== r.platform && "linux" !== r.platform && "sunos" !== r.platform || (r.platform = "UNIX"), "win32" === r.platform && (r.platform = "DOS"); var n = r.comment || this.comment || ""; t = o.generateWorker(this, r, n) } catch (e) { (t = new l("error")).error(e) } return new a(t, r.type || "string", r.mimeType) }, generateAsync: function (e, t) { return this.generateInternalStream(e).accumulate(t) }, generateNodeStream: function (e, t) { return (e = e || {}).type || (e.type = "nodebuffer"), this.generateInternalStream(e).toNodejsStream(t) } }; t.exports = n }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function (e, t, r) { "use strict"; t.exports = e("stream") }, { stream: void 0 }], 17: [function (e, t, r) { "use strict"; var n = e("./DataReader"); function i(e) { n.call(this, e); for (var t = 0; t < this.data.length; t++)e[t] = 255 & e[t] } e("../utils").inherits(i, n), i.prototype.byteAt = function (e) { return this.data[this.zero + e] }, i.prototype.lastIndexOfSignature = function (e) { for (var t = e.charCodeAt(0), r = e.charCodeAt(1), n = e.charCodeAt(2), i = e.charCodeAt(3), s = this.length - 4; 0 <= s; --s)if (this.data[s] === t && this.data[s + 1] === r && this.data[s + 2] === n && this.data[s + 3] === i) return s - this.zero; return -1 }, i.prototype.readAndCheckSignature = function (e) { var t = e.charCodeAt(0), r = e.charCodeAt(1), n = e.charCodeAt(2), i = e.charCodeAt(3), s = this.readData(4); return t === s[0] && r === s[1] && n === s[2] && i === s[3] }, i.prototype.readData = function (e) { if (this.checkOffset(e), 0 === e) return []; var t = this.data.slice(this.zero + this.index, this.zero + this.index + e); return this.index += e, t }, t.exports = i }, { "../utils": 32, "./DataReader": 18 }], 18: [function (e, t, r) { "use strict"; var n = e("../utils"); function i(e) { this.data = e, this.length = e.length, this.index = 0, this.zero = 0 } i.prototype = { checkOffset: function (e) { this.checkIndex(this.index + e) }, checkIndex: function (e) { if (this.length < this.zero + e || e < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e + "). Corrupted zip ?") }, setIndex: function (e) { this.checkIndex(e), this.index = e }, skip: function (e) { this.setIndex(this.index + e) }, byteAt: function () { }, readInt: function (e) { var t, r = 0; for (this.checkOffset(e), t = this.index + e - 1; t >= this.index; t--)r = (r << 8) + this.byteAt(t); return this.index += e, r }, readString: function (e) { return n.transformTo("string", this.readData(e)) }, readData: function () { }, lastIndexOfSignature: function () { }, readAndCheckSignature: function () { }, readDate: function () { var e = this.readInt(4); return new Date(Date.UTC(1980 + (e >> 25 & 127), (e >> 21 & 15) - 1, e >> 16 & 31, e >> 11 & 31, e >> 5 & 63, (31 & e) << 1)) } }, t.exports = i }, { "../utils": 32 }], 19: [function (e, t, r) { "use strict"; var n = e("./Uint8ArrayReader"); function i(e) { n.call(this, e) } e("../utils").inherits(i, n), i.prototype.readData = function (e) { this.checkOffset(e); var t = this.data.slice(this.zero + this.index, this.zero + this.index + e); return this.index += e, t }, t.exports = i }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function (e, t, r) { "use strict"; var n = e("./DataReader"); function i(e) { n.call(this, e) } e("../utils").inherits(i, n), i.prototype.byteAt = function (e) { return this.data.charCodeAt(this.zero + e) }, i.prototype.lastIndexOfSignature = function (e) { return this.data.lastIndexOf(e) - this.zero }, i.prototype.readAndCheckSignature = function (e) { return e === this.readData(4) }, i.prototype.readData = function (e) { this.checkOffset(e); var t = this.data.slice(this.zero + this.index, this.zero + this.index + e); return this.index += e, t }, t.exports = i }, { "../utils": 32, "./DataReader": 18 }], 21: [function (e, t, r) { "use strict"; var n = e("./ArrayReader"); function i(e) { n.call(this, e) } e("../utils").inherits(i, n), i.prototype.readData = function (e) { if (this.checkOffset(e), 0 === e) return new Uint8Array(0); var t = this.data.subarray(this.zero + this.index, this.zero + this.index + e); return this.index += e, t }, t.exports = i }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function (e, t, r) { "use strict"; var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h = e("./Uint8ArrayReader"); t.exports = function (e) { var t = n.getTypeOf(e); return n.checkSupport(t), "string" !== t || i.uint8array ? "nodebuffer" === t ? new o(e) : i.uint8array ? new h(n.transformTo("uint8array", e)) : new s(n.transformTo("array", e)) : new a(e) } }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function (e, t, r) { "use strict"; r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\b" }, {}], 24: [function (e, t, r) { "use strict"; var n = e("./GenericWorker"), i = e("../utils"); function s(e) { n.call(this, "ConvertWorker to " + e), this.destType = e } i.inherits(s, n), s.prototype.processChunk = function (e) { this.push({ data: i.transformTo(this.destType, e.data), meta: e.meta }) }, t.exports = s }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function (e, t, r) { "use strict"; var n = e("./GenericWorker"), i = e("../crc32"); function s() { n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0) } e("../utils").inherits(s, n), s.prototype.processChunk = function (e) { this.streamInfo.crc32 = i(e.data, this.streamInfo.crc32 || 0), this.push(e) }, t.exports = s }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function (e, t, r) { "use strict"; var n = e("../utils"), i = e("./GenericWorker"); function s(e) { i.call(this, "DataLengthProbe for " + e), this.propName = e, this.withStreamInfo(e, 0) } n.inherits(s, i), s.prototype.processChunk = function (e) { if (e) { var t = this.streamInfo[this.propName] || 0; this.streamInfo[this.propName] = t + e.data.length } i.prototype.processChunk.call(this, e) }, t.exports = s }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function (e, t, r) { "use strict"; var n = e("../utils"), i = e("./GenericWorker"); function s(e) { i.call(this, "DataWorker"); var t = this; this.dataIsReady = !1, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = !1, e.then(function (e) { t.dataIsReady = !0, t.data = e, t.max = e && e.length || 0, t.type = n.getTypeOf(e), t.isPaused || t._tickAndRepeat() }, function (e) { t.error(e) }) } n.inherits(s, i), s.prototype.cleanUp = function () { i.prototype.cleanUp.call(this), this.data = null }, s.prototype.resume = function () { return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = !0, n.delay(this._tickAndRepeat, [], this)), !0) }, s.prototype._tickAndRepeat = function () { this._tickScheduled = !1, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = !0)) }, s.prototype._tick = function () { if (this.isPaused || this.isFinished) return !1; var e = null, t = Math.min(this.max, this.index + 16384); if (this.index >= this.max) return this.end(); switch (this.type) { case "string": e = this.data.substring(this.index, t); break; case "uint8array": e = this.data.subarray(this.index, t); break; case "array": case "nodebuffer": e = this.data.slice(this.index, t) }return this.index = t, this.push({ data: e, meta: { percent: this.max ? this.index / this.max * 100 : 0 } }) }, t.exports = s }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function (e, t, r) { "use strict"; function n(e) { this.name = e || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = !0, this.isFinished = !1, this.isLocked = !1, this._listeners = { data: [], end: [], error: [] }, this.previous = null } n.prototype = { push: function (e) { this.emit("data", e) }, end: function () { if (this.isFinished) return !1; this.flush(); try { this.emit("end"), this.cleanUp(), this.isFinished = !0 } catch (e) { this.emit("error", e) } return !0 }, error: function (e) { return !this.isFinished && (this.isPaused ? this.generatedError = e : (this.isFinished = !0, this.emit("error", e), this.previous && this.previous.error(e), this.cleanUp()), !0) }, on: function (e, t) { return this._listeners[e].push(t), this }, cleanUp: function () { this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [] }, emit: function (e, t) { if (this._listeners[e]) for (var r = 0; r < this._listeners[e].length; r++)this._listeners[e][r].call(this, t) }, pipe: function (e) { return e.registerPrevious(this) }, registerPrevious: function (e) { if (this.isLocked) throw new Error("The stream '" + this + "' has already been used."); this.streamInfo = e.streamInfo, this.mergeStreamInfo(), this.previous = e; var t = this; return e.on("data", function (e) { t.processChunk(e) }), e.on("end", function () { t.end() }), e.on("error", function (e) { t.error(e) }), this }, pause: function () { return !this.isPaused && !this.isFinished && (this.isPaused = !0, this.previous && this.previous.pause(), !0) }, resume: function () { if (!this.isPaused || this.isFinished) return !1; var e = this.isPaused = !1; return this.generatedError && (this.error(this.generatedError), e = !0), this.previous && this.previous.resume(), !e }, flush: function () { }, processChunk: function (e) { this.push(e) }, withStreamInfo: function (e, t) { return this.extraStreamInfo[e] = t, this.mergeStreamInfo(), this }, mergeStreamInfo: function () { for (var e in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e) && (this.streamInfo[e] = this.extraStreamInfo[e]) }, lock: function () { if (this.isLocked) throw new Error("The stream '" + this + "' has already been used."); this.isLocked = !0, this.previous && this.previous.lock() }, toString: function () { var e = "Worker " + this.name; return this.previous ? this.previous + " -> " + e : e } }, t.exports = n }, {}], 29: [function (e, t, r) { "use strict"; var h = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null; if (n.nodestream) try { o = e("../nodejs/NodejsStreamOutputAdapter") } catch (e) { } function l(e, o) { return new a.Promise(function (t, r) { var n = [], i = e._internalType, s = e._outputType, a = e._mimeType; e.on("data", function (e, t) { n.push(e), o && o(t) }).on("error", function (e) { n = [], r(e) }).on("end", function () { try { var e = function (e, t, r) { switch (e) { case "blob": return h.newBlob(h.transformTo("arraybuffer", t), r); case "base64": return u.encode(t); default: return h.transformTo(e, t) } }(s, function (e, t) { var r, n = 0, i = null, s = 0; for (r = 0; r < t.length; r++)s += t[r].length; switch (e) { case "string": return t.join(""); case "array": return Array.prototype.concat.apply([], t); case "uint8array": for (i = new Uint8Array(s), r = 0; r < t.length; r++)i.set(t[r], n), n += t[r].length; return i; case "nodebuffer": return Buffer.concat(t); default: throw new Error("concat : unsupported type '" + e + "'") } }(i, n), a); t(e) } catch (e) { r(e) } n = [] }).resume() }) } function f(e, t, r) { var n = t; switch (t) { case "blob": case "arraybuffer": n = "uint8array"; break; case "base64": n = "string" }try { this._internalType = n, this._outputType = t, this._mimeType = r, h.checkSupport(n), this._worker = e.pipe(new i(n)), e.lock() } catch (e) { this._worker = new s("error"), this._worker.error(e) } } f.prototype = { accumulate: function (e) { return l(this, e) }, on: function (e, t) { var r = this; return "data" === e ? this._worker.on(e, function (e) { t.call(r, e.data, e.meta) }) : this._worker.on(e, function () { h.delay(t, arguments, r) }), this }, resume: function () { return h.delay(this._worker.resume, [], this._worker), this }, pause: function () { return this._worker.pause(), this }, toNodejsStream: function (e) { if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method"); return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e) } }, t.exports = f }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function (e, t, r) { "use strict"; if (r.base64 = !0, r.array = !0, r.string = !0, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = !1; else { var n = new ArrayBuffer(0); try { r.blob = 0 === new Blob([n], { type: "application/zip" }).size } catch (e) { try { var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder); i.append(n), r.blob = 0 === i.getBlob("application/zip").size } catch (e) { r.blob = !1 } } } try { r.nodestream = !!e("readable-stream").Readable } catch (e) { r.nodestream = !1 } }, { "readable-stream": 16 }], 31: [function (e, t, s) { "use strict"; for (var o = e("./utils"), h = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++)u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1; u[254] = u[254] = 1; function a() { n.call(this, "utf-8 decode"), this.leftOver = null } function l() { n.call(this, "utf-8 encode") } s.utf8encode = function (e) { return h.nodebuffer ? r.newBufferFrom(e, "utf-8") : function (e) { var t, r, n, i, s, a = e.length, o = 0; for (i = 0; i < a; i++)55296 == (64512 & (r = e.charCodeAt(i))) && i + 1 < a && 56320 == (64512 & (n = e.charCodeAt(i + 1))) && (r = 65536 + (r - 55296 << 10) + (n - 56320), i++), o += r < 128 ? 1 : r < 2048 ? 2 : r < 65536 ? 3 : 4; for (t = h.uint8array ? new Uint8Array(o) : new Array(o), i = s = 0; s < o; i++)55296 == (64512 & (r = e.charCodeAt(i))) && i + 1 < a && 56320 == (64512 & (n = e.charCodeAt(i + 1))) && (r = 65536 + (r - 55296 << 10) + (n - 56320), i++), r < 128 ? t[s++] = r : (r < 2048 ? t[s++] = 192 | r >>> 6 : (r < 65536 ? t[s++] = 224 | r >>> 12 : (t[s++] = 240 | r >>> 18, t[s++] = 128 | r >>> 12 & 63), t[s++] = 128 | r >>> 6 & 63), t[s++] = 128 | 63 & r); return t }(e) }, s.utf8decode = function (e) { return h.nodebuffer ? o.transformTo("nodebuffer", e).toString("utf-8") : function (e) { var t, r, n, i, s = e.length, a = new Array(2 * s); for (t = r = 0; t < s;)if ((n = e[t++]) < 128) a[r++] = n; else if (4 < (i = u[n])) a[r++] = 65533, t += i - 1; else { for (n &= 2 === i ? 31 : 3 === i ? 15 : 7; 1 < i && t < s;)n = n << 6 | 63 & e[t++], i--; 1 < i ? a[r++] = 65533 : n < 65536 ? a[r++] = n : (n -= 65536, a[r++] = 55296 | n >> 10 & 1023, a[r++] = 56320 | 1023 & n) } return a.length !== r && (a.subarray ? a = a.subarray(0, r) : a.length = r), o.applyFromCharCode(a) }(e = o.transformTo(h.uint8array ? "uint8array" : "array", e)) }, o.inherits(a, n), a.prototype.processChunk = function (e) { var t = o.transformTo(h.uint8array ? "uint8array" : "array", e.data); if (this.leftOver && this.leftOver.length) { if (h.uint8array) { var r = t; (t = new Uint8Array(r.length + this.leftOver.length)).set(this.leftOver, 0), t.set(r, this.leftOver.length) } else t = this.leftOver.concat(t); this.leftOver = null } var n = function (e, t) { var r; for ((t = t || e.length) > e.length && (t = e.length), r = t - 1; 0 <= r && 128 == (192 & e[r]);)r--; return r < 0 ? t : 0 === r ? t : r + u[e[r]] > t ? r : t }(t), i = t; n !== t.length && (h.uint8array ? (i = t.subarray(0, n), this.leftOver = t.subarray(n, t.length)) : (i = t.slice(0, n), this.leftOver = t.slice(n, t.length))), this.push({ data: s.utf8decode(i), meta: e.meta }) }, a.prototype.flush = function () { this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null) }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function (e) { this.push({ data: s.utf8encode(e.data), meta: e.meta }) }, s.Utf8EncodeWorker = l }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function (e, t, a) { "use strict"; var o = e("./support"), h = e("./base64"), r = e("./nodejsUtils"), u = e("./external"); function n(e) { return e } function l(e, t) { for (var r = 0; r < e.length; ++r)t[r] = 255 & e.charCodeAt(r); return t } e("setimmediate"), a.newBlob = function (t, r) { a.checkSupport("blob"); try { return new Blob([t], { type: r }) } catch (e) { try { var n = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder); return n.append(t), n.getBlob(r) } catch (e) { throw new Error("Bug : can't construct the Blob.") } } }; var i = { stringifyByChunk: function (e, t, r) { var n = [], i = 0, s = e.length; if (s <= r) return String.fromCharCode.apply(null, e); for (; i < s;)"array" === t || "nodebuffer" === t ? n.push(String.fromCharCode.apply(null, e.slice(i, Math.min(i + r, s)))) : n.push(String.fromCharCode.apply(null, e.subarray(i, Math.min(i + r, s)))), i += r; return n.join("") }, stringifyByChar: function (e) { for (var t = "", r = 0; r < e.length; r++)t += String.fromCharCode(e[r]); return t }, applyCanBeUsed: { uint8array: function () { try { return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length } catch (e) { return !1 } }(), nodebuffer: function () { try { return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length } catch (e) { return !1 } }() } }; function s(e) { var t = 65536, r = a.getTypeOf(e), n = !0; if ("uint8array" === r ? n = i.applyCanBeUsed.uint8array : "nodebuffer" === r && (n = i.applyCanBeUsed.nodebuffer), n) for (; 1 < t;)try { return i.stringifyByChunk(e, r, t) } catch (e) { t = Math.floor(t / 2) } return i.stringifyByChar(e) } function f(e, t) { for (var r = 0; r < e.length; r++)t[r] = e[r]; return t } a.applyFromCharCode = s; var c = {}; c.string = { string: n, array: function (e) { return l(e, new Array(e.length)) }, arraybuffer: function (e) { return c.string.uint8array(e).buffer }, uint8array: function (e) { return l(e, new Uint8Array(e.length)) }, nodebuffer: function (e) { return l(e, r.allocBuffer(e.length)) } }, c.array = { string: s, array: n, arraybuffer: function (e) { return new Uint8Array(e).buffer }, uint8array: function (e) { return new Uint8Array(e) }, nodebuffer: function (e) { return r.newBufferFrom(e) } }, c.arraybuffer = { string: function (e) { return s(new Uint8Array(e)) }, array: function (e) { return f(new Uint8Array(e), new Array(e.byteLength)) }, arraybuffer: n, uint8array: function (e) { return new Uint8Array(e) }, nodebuffer: function (e) { return r.newBufferFrom(new Uint8Array(e)) } }, c.uint8array = { string: s, array: function (e) { return f(e, new Array(e.length)) }, arraybuffer: function (e) { return e.buffer }, uint8array: n, nodebuffer: function (e) { return r.newBufferFrom(e) } }, c.nodebuffer = { string: s, array: function (e) { return f(e, new Array(e.length)) }, arraybuffer: function (e) { return c.nodebuffer.uint8array(e).buffer }, uint8array: function (e) { return f(e, new Uint8Array(e.length)) }, nodebuffer: n }, a.transformTo = function (e, t) { if (t = t || "", !e) return t; a.checkSupport(e); var r = a.getTypeOf(t); return c[r][e](t) }, a.resolve = function (e) { for (var t = e.split("/"), r = [], n = 0; n < t.length; n++) { var i = t[n]; "." === i || "" === i && 0 !== n && n !== t.length - 1 || (".." === i ? r.pop() : r.push(i)) } return r.join("/") }, a.getTypeOf = function (e) { return "string" == typeof e ? "string" : "[object Array]" === Object.prototype.toString.call(e) ? "array" : o.nodebuffer && r.isBuffer(e) ? "nodebuffer" : o.uint8array && e instanceof Uint8Array ? "uint8array" : o.arraybuffer && e instanceof ArrayBuffer ? "arraybuffer" : void 0 }, a.checkSupport = function (e) { if (!o[e.toLowerCase()]) throw new Error(e + " is not supported by this platform") }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function (e) { var t, r, n = ""; for (r = 0; r < (e || "").length; r++)n += "\\x" + ((t = e.charCodeAt(r)) < 16 ? "0" : "") + t.toString(16).toUpperCase(); return n }, a.delay = function (e, t, r) { setImmediate(function () { e.apply(r || null, t || []) }) }, a.inherits = function (e, t) { function r() { } r.prototype = t.prototype, e.prototype = new r }, a.extend = function () { var e, t, r = {}; for (e = 0; e < arguments.length; e++)for (t in arguments[e]) Object.prototype.hasOwnProperty.call(arguments[e], t) && void 0 === r[t] && (r[t] = arguments[e][t]); return r }, a.prepareContent = function (r, e, n, i, s) { return u.Promise.resolve(e).then(function (n) { return o.blob && (n instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n))) && "undefined" != typeof FileReader ? new u.Promise(function (t, r) { var e = new FileReader; e.onload = function (e) { t(e.target.result) }, e.onerror = function (e) { r(e.target.error) }, e.readAsArrayBuffer(n) }) : n }).then(function (e) { var t = a.getTypeOf(e); return t ? ("arraybuffer" === t ? e = a.transformTo("uint8array", e) : "string" === t && (s ? e = h.decode(e) : n && !0 !== i && (e = function (e) { return l(e, o.uint8array ? new Uint8Array(e.length) : new Array(e.length)) }(e))), e) : u.Promise.reject(new Error("Can't read the data of '" + r + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?")) }) } }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function (e, t, r) { "use strict"; var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support"); function h(e) { this.files = [], this.loadOptions = e } h.prototype = { checkSignature: function (e) { if (!this.reader.readAndCheckSignature(e)) { this.reader.index -= 4; var t = this.reader.readString(4); throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t) + ", expected " + i.pretty(e) + ")") } }, isSignature: function (e, t) { var r = this.reader.index; this.reader.setIndex(e); var n = this.reader.readString(4) === t; return this.reader.setIndex(r), n }, readBlockEndOfCentral: function () { this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2); var e = this.reader.readData(this.zipCommentLength), t = o.uint8array ? "uint8array" : "array", r = i.transformTo(t, e); this.zipComment = this.loadOptions.decodeFileName(r) }, readBlockZip64EndOfCentral: function () { this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {}; for (var e, t, r, n = this.zip64EndOfCentralSize - 44; 0 < n;)e = this.reader.readInt(2), t = this.reader.readInt(4), r = this.reader.readData(t), this.zip64ExtensibleData[e] = { id: e, length: t, value: r } }, readBlockZip64EndOfCentralLocator: function () { if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported") }, readLocalFiles: function () { var e, t; for (e = 0; e < this.files.length; e++)t = this.files[e], this.reader.setIndex(t.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t.readLocalPart(this.reader), t.handleUTF8(), t.processAttributes() }, readCentralDir: function () { var e; for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER);)(e = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e); if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length) }, readEndOfCentral: function () { var e = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END); if (e < 0) throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory"); this.reader.setIndex(e); var t = e; if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) { if (this.zip64 = !0, (e = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator"); if (this.reader.setIndex(e), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory"); this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral() } var r = this.centralDirOffset + this.centralDirSize; this.zip64 && (r += 20, r += 12 + this.zip64EndOfCentralSize); var n = t - r; if (0 < n) this.isSignature(t, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n); else if (n < 0) throw new Error("Corrupted zip: missing " + Math.abs(n) + " bytes.") }, prepareReader: function (e) { this.reader = n(e) }, load: function (e) { this.prepareReader(e), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles() } }, t.exports = h }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function (e, t, r) { "use strict"; var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h = e("./compressions"), u = e("./support"); function l(e, t) { this.options = e, this.loadOptions = t } l.prototype = { isEncrypted: function () { return 1 == (1 & this.bitFlag) }, useUTF8: function () { return 2048 == (2048 & this.bitFlag) }, readLocalPart: function (e) { var t, r; if (e.skip(22), this.fileNameLength = e.readInt(2), r = e.readInt(2), this.fileName = e.readData(this.fileNameLength), e.skip(r), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)"); if (null === (t = function (e) { for (var t in h) if (Object.prototype.hasOwnProperty.call(h, t) && h[t].magic === e) return h[t]; return null }(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")"); this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t, e.readData(this.compressedSize)) }, readCentralPart: function (e) { this.versionMadeBy = e.readInt(2), e.skip(2), this.bitFlag = e.readInt(2), this.compressionMethod = e.readString(2), this.date = e.readDate(), this.crc32 = e.readInt(4), this.compressedSize = e.readInt(4), this.uncompressedSize = e.readInt(4); var t = e.readInt(2); if (this.extraFieldsLength = e.readInt(2), this.fileCommentLength = e.readInt(2), this.diskNumberStart = e.readInt(2), this.internalFileAttributes = e.readInt(2), this.externalFileAttributes = e.readInt(4), this.localHeaderOffset = e.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported"); e.skip(t), this.readExtraFields(e), this.parseZIP64ExtraField(e), this.fileComment = e.readData(this.fileCommentLength) }, processAttributes: function () { this.unixPermissions = null, this.dosPermissions = null; var e = this.versionMadeBy >> 8; this.dir = !!(16 & this.externalFileAttributes), 0 == e && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = !0) }, parseZIP64ExtraField: function () { if (this.extraFields[1]) { var e = n(this.extraFields[1].value); this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e.readInt(4)) } }, readExtraFields: function (e) { var t, r, n, i = e.index + this.extraFieldsLength; for (this.extraFields || (this.extraFields = {}); e.index + 4 < i;)t = e.readInt(2), r = e.readInt(2), n = e.readData(r), this.extraFields[t] = { id: t, length: r, value: n }; e.setIndex(i) }, handleUTF8: function () { var e = u.uint8array ? "uint8array" : "array"; if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment); else { var t = this.findExtraFieldUnicodePath(); if (null !== t) this.fileNameStr = t; else { var r = s.transformTo(e, this.fileName); this.fileNameStr = this.loadOptions.decodeFileName(r) } var n = this.findExtraFieldUnicodeComment(); if (null !== n) this.fileCommentStr = n; else { var i = s.transformTo(e, this.fileComment); this.fileCommentStr = this.loadOptions.decodeFileName(i) } } }, findExtraFieldUnicodePath: function () { var e = this.extraFields[28789]; if (e) { var t = n(e.value); return 1 !== t.readInt(1) ? null : a(this.fileName) !== t.readInt(4) ? null : o.utf8decode(t.readData(e.length - 5)) } return null }, findExtraFieldUnicodeComment: function () { var e = this.extraFields[25461]; if (e) { var t = n(e.value); return 1 !== t.readInt(1) ? null : a(this.fileComment) !== t.readInt(4) ? null : o.utf8decode(t.readData(e.length - 5)) } return null } }, t.exports = l }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function (e, t, r) { "use strict"; function n(e, t, r) { this.name = e, this.dir = r.dir, this.date = r.date, this.comment = r.comment, this.unixPermissions = r.unixPermissions, this.dosPermissions = r.dosPermissions, this._data = t, this._dataBinary = r.binary, this.options = { compression: r.compression, compressionOptions: r.compressionOptions } } var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h = e("./stream/GenericWorker"); n.prototype = { internalStream: function (e) { var t = null, r = "string"; try { if (!e) throw new Error("No output type specified."); var n = "string" === (r = e.toLowerCase()) || "text" === r; "binarystring" !== r && "text" !== r || (r = "string"), t = this._decompressWorker(); var i = !this._dataBinary; i && !n && (t = t.pipe(new a.Utf8EncodeWorker)), !i && n && (t = t.pipe(new a.Utf8DecodeWorker)) } catch (e) { (t = new h("error")).error(e) } return new s(t, r, "") }, async: function (e, t) { return this.internalStream(e).accumulate(t) }, nodeStream: function (e, t) { return this.internalStream(e || "nodebuffer").toNodejsStream(t) }, _compressWorker: function (e, t) { if (this._data instanceof o && this._data.compression.magic === e.magic) return this._data.getCompressedWorker(); var r = this._decompressWorker(); return this._dataBinary || (r = r.pipe(new a.Utf8EncodeWorker)), o.createWorkerFrom(r, e, t) }, _decompressWorker: function () { return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new i(this._data) } }; for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function () { throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.") }, f = 0; f < u.length; f++)n.prototype[u[f]] = l; t.exports = n }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function (e, l, t) { (function (t) { "use strict"; var r, n, e = t.MutationObserver || t.WebKitMutationObserver; if (e) { var i = 0, s = new e(u), a = t.document.createTextNode(""); s.observe(a, { characterData: !0 }), r = function () { a.data = i = ++i % 2 } } else if (t.setImmediate || void 0 === t.MessageChannel) r = "document" in t && "onreadystatechange" in t.document.createElement("script") ? function () { var e = t.document.createElement("script"); e.onreadystatechange = function () { u(), e.onreadystatechange = null, e.parentNode.removeChild(e), e = null }, t.document.documentElement.appendChild(e) } : function () { setTimeout(u, 0) }; else { var o = new t.MessageChannel; o.port1.onmessage = u, r = function () { o.port2.postMessage(0) } } var h = []; function u() { var e, t; n = !0; for (var r = h.length; r;) { for (t = h, h = [], e = -1; ++e < r;)t[e](); r = h.length } n = !1 } l.exports = function (e) { 1 !== h.push(e) || n || r() } }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}) }, {}], 37: [function (e, t, r) { "use strict"; var i = e("immediate"); function u() { } var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"]; function o(e) { if ("function" != typeof e) throw new TypeError("resolver must be a function"); this.state = n, this.queue = [], this.outcome = void 0, e !== u && d(this, e) } function h(e, t, r) { this.promise = e, "function" == typeof t && (this.onFulfilled = t, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r && (this.onRejected = r, this.callRejected = this.otherCallRejected) } function f(t, r, n) { i(function () { var e; try { e = r(n) } catch (e) { return l.reject(t, e) } e === t ? l.reject(t, new TypeError("Cannot resolve promise with itself")) : l.resolve(t, e) }) } function c(e) { var t = e && e.then; if (e && ("object" == typeof e || "function" == typeof e) && "function" == typeof t) return function () { t.apply(e, arguments) } } function d(t, e) { var r = !1; function n(e) { r || (r = !0, l.reject(t, e)) } function i(e) { r || (r = !0, l.resolve(t, e)) } var s = p(function () { e(i, n) }); "error" === s.status && n(s.value) } function p(e, t) { var r = {}; try { r.value = e(t), r.status = "success" } catch (e) { r.status = "error", r.value = e } return r } (t.exports = o).prototype.finally = function (t) { if ("function" != typeof t) return this; var r = this.constructor; return this.then(function (e) { return r.resolve(t()).then(function () { return e }) }, function (e) { return r.resolve(t()).then(function () { throw e }) }) }, o.prototype.catch = function (e) { return this.then(null, e) }, o.prototype.then = function (e, t) { if ("function" != typeof e && this.state === a || "function" != typeof t && this.state === s) return this; var r = new this.constructor(u); this.state !== n ? f(r, this.state === a ? e : t, this.outcome) : this.queue.push(new h(r, e, t)); return r }, h.prototype.callFulfilled = function (e) { l.resolve(this.promise, e) }, h.prototype.otherCallFulfilled = function (e) { f(this.promise, this.onFulfilled, e) }, h.prototype.callRejected = function (e) { l.reject(this.promise, e) }, h.prototype.otherCallRejected = function (e) { f(this.promise, this.onRejected, e) }, l.resolve = function (e, t) { var r = p(c, t); if ("error" === r.status) return l.reject(e, r.value); var n = r.value; if (n) d(e, n); else { e.state = a, e.outcome = t; for (var i = -1, s = e.queue.length; ++i < s;)e.queue[i].callFulfilled(t) } return e }, l.reject = function (e, t) { e.state = s, e.outcome = t; for (var r = -1, n = e.queue.length; ++r < n;)e.queue[r].callRejected(t); return e }, o.resolve = function (e) { if (e instanceof this) return e; return l.resolve(new this(u), e) }, o.reject = function (e) { var t = new this(u); return l.reject(t, e) }, o.all = function (e) { var r = this; if ("[object Array]" !== Object.prototype.toString.call(e)) return this.reject(new TypeError("must be an array")); var n = e.length, i = !1; if (!n) return this.resolve([]); var s = new Array(n), a = 0, t = -1, o = new this(u); for (; ++t < n;)h(e[t], t); return o; function h(e, t) { r.resolve(e).then(function (e) { s[t] = e, ++a !== n || i || (i = !0, l.resolve(o, s)) }, function (e) { i || (i = !0, l.reject(o, e)) }) } }, o.race = function (e) { var t = this; if ("[object Array]" !== Object.prototype.toString.call(e)) return this.reject(new TypeError("must be an array")); var r = e.length, n = !1; if (!r) return this.resolve([]); var i = -1, s = new this(u); for (; ++i < r;)a = e[i], t.resolve(a).then(function (e) { n || (n = !0, l.resolve(s, e)) }, function (e) { n || (n = !0, l.reject(s, e)) }); var a; return s } }, { immediate: 36 }], 38: [function (e, t, r) { "use strict"; var n = {}; (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t.exports = n }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function (e, t, r) { "use strict"; var a = e("./zlib/deflate"), o = e("./utils/common"), h = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8; function p(e) { if (!(this instanceof p)) return new p(e); this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e || {}); var t = this.options; t.raw && 0 < t.windowBits ? t.windowBits = -t.windowBits : t.gzip && 0 < t.windowBits && t.windowBits < 16 && (t.windowBits += 16), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new s, this.strm.avail_out = 0; var r = a.deflateInit2(this.strm, t.level, t.method, t.windowBits, t.memLevel, t.strategy); if (r !== l) throw new Error(i[r]); if (t.header && a.deflateSetHeader(this.strm, t.header), t.dictionary) { var n; if (n = "string" == typeof t.dictionary ? h.string2buf(t.dictionary) : "[object ArrayBuffer]" === u.call(t.dictionary) ? new Uint8Array(t.dictionary) : t.dictionary, (r = a.deflateSetDictionary(this.strm, n)) !== l) throw new Error(i[r]); this._dict_set = !0 } } function n(e, t) { var r = new p(t); if (r.push(e, !0), r.err) throw r.msg || i[r.err]; return r.result } p.prototype.push = function (e, t) { var r, n, i = this.strm, s = this.options.chunkSize; if (this.ended) return !1; n = t === ~~t ? t : !0 === t ? 4 : 0, "string" == typeof e ? i.input = h.string2buf(e) : "[object ArrayBuffer]" === u.call(e) ? i.input = new Uint8Array(e) : i.input = e, i.next_in = 0, i.avail_in = i.input.length; do { if (0 === i.avail_out && (i.output = new o.Buf8(s), i.next_out = 0, i.avail_out = s), 1 !== (r = a.deflate(i, n)) && r !== l) return this.onEnd(r), !(this.ended = !0); 0 !== i.avail_out && (0 !== i.avail_in || 4 !== n && 2 !== n) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(i.output, i.next_out))) : this.onData(o.shrinkBuf(i.output, i.next_out))) } while ((0 < i.avail_in || 0 === i.avail_out) && 1 !== r); return 4 === n ? (r = a.deflateEnd(this.strm), this.onEnd(r), this.ended = !0, r === l) : 2 !== n || (this.onEnd(l), !(i.avail_out = 0)) }, p.prototype.onData = function (e) { this.chunks.push(e) }, p.prototype.onEnd = function (e) { e === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e, this.msg = this.strm.msg }, r.Deflate = p, r.deflate = n, r.deflateRaw = function (e, t) { return (t = t || {}).raw = !0, n(e, t) }, r.gzip = function (e, t) { return (t = t || {}).gzip = !0, n(e, t) } }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function (e, t, r) { "use strict"; var c = e("./zlib/inflate"), d = e("./utils/common"), p = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString; function a(e) { if (!(this instanceof a)) return new a(e); this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e || {}); var t = this.options; t.raw && 0 <= t.windowBits && t.windowBits < 16 && (t.windowBits = -t.windowBits, 0 === t.windowBits && (t.windowBits = -15)), !(0 <= t.windowBits && t.windowBits < 16) || e && e.windowBits || (t.windowBits += 32), 15 < t.windowBits && t.windowBits < 48 && 0 == (15 & t.windowBits) && (t.windowBits |= 15), this.err = 0, this.msg = "", this.ended = !1, this.chunks = [], this.strm = new i, this.strm.avail_out = 0; var r = c.inflateInit2(this.strm, t.windowBits); if (r !== m.Z_OK) throw new Error(n[r]); this.header = new s, c.inflateGetHeader(this.strm, this.header) } function o(e, t) { var r = new a(t); if (r.push(e, !0), r.err) throw r.msg || n[r.err]; return r.result } a.prototype.push = function (e, t) { var r, n, i, s, a, o, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = !1; if (this.ended) return !1; n = t === ~~t ? t : !0 === t ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e ? h.input = p.binstring2buf(e) : "[object ArrayBuffer]" === _.call(e) ? h.input = new Uint8Array(e) : h.input = e, h.next_in = 0, h.avail_in = h.input.length; do { if (0 === h.avail_out && (h.output = new d.Buf8(u), h.next_out = 0, h.avail_out = u), (r = c.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r = c.inflateSetDictionary(this.strm, o)), r === m.Z_BUF_ERROR && !0 === f && (r = m.Z_OK, f = !1), r !== m.Z_STREAM_END && r !== m.Z_OK) return this.onEnd(r), !(this.ended = !0); h.next_out && (0 !== h.avail_out && r !== m.Z_STREAM_END && (0 !== h.avail_in || n !== m.Z_FINISH && n !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i = p.utf8border(h.output, h.next_out), s = h.next_out - i, a = p.buf2string(h.output, i), h.next_out = s, h.avail_out = u - s, s && d.arraySet(h.output, h.output, i, s, 0), this.onData(a)) : this.onData(d.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = !0) } while ((0 < h.avail_in || 0 === h.avail_out) && r !== m.Z_STREAM_END); return r === m.Z_STREAM_END && (n = m.Z_FINISH), n === m.Z_FINISH ? (r = c.inflateEnd(this.strm), this.onEnd(r), this.ended = !0, r === m.Z_OK) : n !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0)) }, a.prototype.onData = function (e) { this.chunks.push(e) }, a.prototype.onEnd = function (e) { e === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e, this.msg = this.strm.msg }, r.Inflate = a, r.inflate = o, r.inflateRaw = function (e, t) { return (t = t || {}).raw = !0, o(e, t) }, r.ungzip = o }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function (e, t, r) { "use strict"; var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array; r.assign = function (e) { for (var t = Array.prototype.slice.call(arguments, 1); t.length;) { var r = t.shift(); if (r) { if ("object" != typeof r) throw new TypeError(r + "must be non-object"); for (var n in r) r.hasOwnProperty(n) && (e[n] = r[n]) } } return e }, r.shrinkBuf = function (e, t) { return e.length === t ? e : e.subarray ? e.subarray(0, t) : (e.length = t, e) }; var i = { arraySet: function (e, t, r, n, i) { if (t.subarray && e.subarray) e.set(t.subarray(r, r + n), i); else for (var s = 0; s < n; s++)e[i + s] = t[r + s] }, flattenChunks: function (e) { var t, r, n, i, s, a; for (t = n = 0, r = e.length; t < r; t++)n += e[t].length; for (a = new Uint8Array(n), t = i = 0, r = e.length; t < r; t++)s = e[t], a.set(s, i), i += s.length; return a } }, s = { arraySet: function (e, t, r, n, i) { for (var s = 0; s < n; s++)e[i + s] = t[r + s] }, flattenChunks: function (e) { return [].concat.apply([], e) } }; r.setTyped = function (e) { e ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s)) }, r.setTyped(n) }, {}], 42: [function (e, t, r) { "use strict"; var h = e("./common"), i = !0, s = !0; try { String.fromCharCode.apply(null, [0]) } catch (e) { i = !1 } try { String.fromCharCode.apply(null, new Uint8Array(1)) } catch (e) { s = !1 } for (var u = new h.Buf8(256), n = 0; n < 256; n++)u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1; function l(e, t) { if (t < 65537 && (e.subarray && s || !e.subarray && i)) return String.fromCharCode.apply(null, h.shrinkBuf(e, t)); for (var r = "", n = 0; n < t; n++)r += String.fromCharCode(e[n]); return r } u[254] = u[254] = 1, r.string2buf = function (e) { var t, r, n, i, s, a = e.length, o = 0; for (i = 0; i < a; i++)55296 == (64512 & (r = e.charCodeAt(i))) && i + 1 < a && 56320 == (64512 & (n = e.charCodeAt(i + 1))) && (r = 65536 + (r - 55296 << 10) + (n - 56320), i++), o += r < 128 ? 1 : r < 2048 ? 2 : r < 65536 ? 3 : 4; for (t = new h.Buf8(o), i = s = 0; s < o; i++)55296 == (64512 & (r = e.charCodeAt(i))) && i + 1 < a && 56320 == (64512 & (n = e.charCodeAt(i + 1))) && (r = 65536 + (r - 55296 << 10) + (n - 56320), i++), r < 128 ? t[s++] = r : (r < 2048 ? t[s++] = 192 | r >>> 6 : (r < 65536 ? t[s++] = 224 | r >>> 12 : (t[s++] = 240 | r >>> 18, t[s++] = 128 | r >>> 12 & 63), t[s++] = 128 | r >>> 6 & 63), t[s++] = 128 | 63 & r); return t }, r.buf2binstring = function (e) { return l(e, e.length) }, r.binstring2buf = function (e) { for (var t = new h.Buf8(e.length), r = 0, n = t.length; r < n; r++)t[r] = e.charCodeAt(r); return t }, r.buf2string = function (e, t) { var r, n, i, s, a = t || e.length, o = new Array(2 * a); for (r = n = 0; r < a;)if ((i = e[r++]) < 128) o[n++] = i; else if (4 < (s = u[i])) o[n++] = 65533, r += s - 1; else { for (i &= 2 === s ? 31 : 3 === s ? 15 : 7; 1 < s && r < a;)i = i << 6 | 63 & e[r++], s--; 1 < s ? o[n++] = 65533 : i < 65536 ? o[n++] = i : (i -= 65536, o[n++] = 55296 | i >> 10 & 1023, o[n++] = 56320 | 1023 & i) } return l(o, n) }, r.utf8border = function (e, t) { var r; for ((t = t || e.length) > e.length && (t = e.length), r = t - 1; 0 <= r && 128 == (192 & e[r]);)r--; return r < 0 ? t : 0 === r ? t : r + u[e[r]] > t ? r : t } }, { "./common": 41 }], 43: [function (e, t, r) { "use strict"; t.exports = function (e, t, r, n) { for (var i = 65535 & e | 0, s = e >>> 16 & 65535 | 0, a = 0; 0 !== r;) { for (r -= a = 2e3 < r ? 2e3 : r; s = s + (i = i + t[n++] | 0) | 0, --a;); i %= 65521, s %= 65521 } return i | s << 16 | 0 } }, {}], 44: [function (e, t, r) { "use strict"; t.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 } }, {}], 45: [function (e, t, r) { "use strict"; var o = function () { for (var e, t = [], r = 0; r < 256; r++) { e = r; for (var n = 0; n < 8; n++)e = 1 & e ? 3988292384 ^ e >>> 1 : e >>> 1; t[r] = e } return t }(); t.exports = function (e, t, r, n) { var i = o, s = n + r; e ^= -1; for (var a = n; a < s; a++)e = e >>> 8 ^ i[255 & (e ^ t[a])]; return -1 ^ e } }, {}], 46: [function (e, t, r) { "use strict"; var h, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4; function R(e, t) { return e.msg = n[t], t } function T(e) { return (e << 1) - (4 < e ? 9 : 0) } function D(e) { for (var t = e.length; 0 <= --t;)e[t] = 0 } function F(e) { var t = e.state, r = t.pending; r > e.avail_out && (r = e.avail_out), 0 !== r && (c.arraySet(e.output, t.pending_buf, t.pending_out, r, e.next_out), e.next_out += r, t.pending_out += r, e.total_out += r, e.avail_out -= r, t.pending -= r, 0 === t.pending && (t.pending_out = 0)) } function N(e, t) { u._tr_flush_block(e, 0 <= e.block_start ? e.block_start : -1, e.strstart - e.block_start, t), e.block_start = e.strstart, F(e.strm) } function U(e, t) { e.pending_buf[e.pending++] = t } function P(e, t) { e.pending_buf[e.pending++] = t >>> 8 & 255, e.pending_buf[e.pending++] = 255 & t } function L(e, t) { var r, n, i = e.max_chain_length, s = e.strstart, a = e.prev_length, o = e.nice_match, h = e.strstart > e.w_size - z ? e.strstart - (e.w_size - z) : 0, u = e.window, l = e.w_mask, f = e.prev, c = e.strstart + S, d = u[s + a - 1], p = u[s + a]; e.prev_length >= e.good_match && (i >>= 2), o > e.lookahead && (o = e.lookahead); do { if (u[(r = t) + a] === p && u[r + a - 1] === d && u[r] === u[s] && u[++r] === u[s + 1]) { s += 2, r++; do { } while (u[++s] === u[++r] && u[++s] === u[++r] && u[++s] === u[++r] && u[++s] === u[++r] && u[++s] === u[++r] && u[++s] === u[++r] && u[++s] === u[++r] && u[++s] === u[++r] && s < c); if (n = S - (c - s), s = c - S, a < n) { if (e.match_start = t, o <= (a = n)) break; d = u[s + a - 1], p = u[s + a] } } } while ((t = f[t & l]) > h && 0 != --i); return a <= e.lookahead ? a : e.lookahead } function j(e) { var t, r, n, i, s, a, o, h, u, l, f = e.w_size; do { if (i = e.window_size - e.lookahead - e.strstart, e.strstart >= f + (f - z)) { for (c.arraySet(e.window, e.window, f, f, 0), e.match_start -= f, e.strstart -= f, e.block_start -= f, t = r = e.hash_size; n = e.head[--t], e.head[t] = f <= n ? n - f : 0, --r;); for (t = r = f; n = e.prev[--t], e.prev[t] = f <= n ? n - f : 0, --r;); i += f } if (0 === e.strm.avail_in) break; if (a = e.strm, o = e.window, h = e.strstart + e.lookahead, u = i, l = void 0, l = a.avail_in, u < l && (l = u), r = 0 === l ? 0 : (a.avail_in -= l, c.arraySet(o, a.input, a.next_in, l, h), 1 === a.state.wrap ? a.adler = d(a.adler, o, l, h) : 2 === a.state.wrap && (a.adler = p(a.adler, o, l, h)), a.next_in += l, a.total_in += l, l), e.lookahead += r, e.lookahead + e.insert >= x) for (s = e.strstart - e.insert, e.ins_h = e.window[s], e.ins_h = (e.ins_h << e.hash_shift ^ e.window[s + 1]) & e.hash_mask; e.insert && (e.ins_h = (e.ins_h << e.hash_shift ^ e.window[s + x - 1]) & e.hash_mask, e.prev[s & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = s, s++, e.insert--, !(e.lookahead + e.insert < x));); } while (e.lookahead < z && 0 !== e.strm.avail_in) } function Z(e, t) { for (var r, n; ;) { if (e.lookahead < z) { if (j(e), e.lookahead < z && t === l) return A; if (0 === e.lookahead) break } if (r = 0, e.lookahead >= x && (e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + x - 1]) & e.hash_mask, r = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart), 0 !== r && e.strstart - r <= e.w_size - z && (e.match_length = L(e, r)), e.match_length >= x) if (n = u._tr_tally(e, e.strstart - e.match_start, e.match_length - x), e.lookahead -= e.match_length, e.match_length <= e.max_lazy_match && e.lookahead >= x) { for (e.match_length--; e.strstart++, e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + x - 1]) & e.hash_mask, r = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart, 0 != --e.match_length;); e.strstart++ } else e.strstart += e.match_length, e.match_length = 0, e.ins_h = e.window[e.strstart], e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + 1]) & e.hash_mask; else n = u._tr_tally(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++; if (n && (N(e, !1), 0 === e.strm.avail_out)) return A } return e.insert = e.strstart < x - 1 ? e.strstart : x - 1, t === f ? (N(e, !0), 0 === e.strm.avail_out ? O : B) : e.last_lit && (N(e, !1), 0 === e.strm.avail_out) ? A : I } function W(e, t) { for (var r, n, i; ;) { if (e.lookahead < z) { if (j(e), e.lookahead < z && t === l) return A; if (0 === e.lookahead) break } if (r = 0, e.lookahead >= x && (e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + x - 1]) & e.hash_mask, r = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart), e.prev_length = e.match_length, e.prev_match = e.match_start, e.match_length = x - 1, 0 !== r && e.prev_length < e.max_lazy_match && e.strstart - r <= e.w_size - z && (e.match_length = L(e, r), e.match_length <= 5 && (1 === e.strategy || e.match_length === x && 4096 < e.strstart - e.match_start) && (e.match_length = x - 1)), e.prev_length >= x && e.match_length <= e.prev_length) { for (i = e.strstart + e.lookahead - x, n = u._tr_tally(e, e.strstart - 1 - e.prev_match, e.prev_length - x), e.lookahead -= e.prev_length - 1, e.prev_length -= 2; ++e.strstart <= i && (e.ins_h = (e.ins_h << e.hash_shift ^ e.window[e.strstart + x - 1]) & e.hash_mask, r = e.prev[e.strstart & e.w_mask] = e.head[e.ins_h], e.head[e.ins_h] = e.strstart), 0 != --e.prev_length;); if (e.match_available = 0, e.match_length = x - 1, e.strstart++, n && (N(e, !1), 0 === e.strm.avail_out)) return A } else if (e.match_available) { if ((n = u._tr_tally(e, 0, e.window[e.strstart - 1])) && N(e, !1), e.strstart++, e.lookahead--, 0 === e.strm.avail_out) return A } else e.match_available = 1, e.strstart++, e.lookahead-- } return e.match_available && (n = u._tr_tally(e, 0, e.window[e.strstart - 1]), e.match_available = 0), e.insert = e.strstart < x - 1 ? e.strstart : x - 1, t === f ? (N(e, !0), 0 === e.strm.avail_out ? O : B) : e.last_lit && (N(e, !1), 0 === e.strm.avail_out) ? A : I } function M(e, t, r, n, i) { this.good_length = e, this.max_lazy = t, this.nice_length = r, this.max_chain = n, this.func = i } function H() { this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0 } function G(e) { var t; return e && e.state ? (e.total_in = e.total_out = 0, e.data_type = i, (t = e.state).pending = 0, t.pending_out = 0, t.wrap < 0 && (t.wrap = -t.wrap), t.status = t.wrap ? C : E, e.adler = 2 === t.wrap ? 0 : 1, t.last_flush = l, u._tr_init(t), m) : R(e, _) } function K(e) { var t = G(e); return t === m && function (e) { e.window_size = 2 * e.w_size, D(e.head), e.max_lazy_match = h[e.level].max_lazy, e.good_match = h[e.level].good_length, e.nice_match = h[e.level].nice_length, e.max_chain_length = h[e.level].max_chain, e.strstart = 0, e.block_start = 0, e.lookahead = 0, e.insert = 0, e.match_length = e.prev_length = x - 1, e.match_available = 0, e.ins_h = 0 }(e.state), t } function Y(e, t, r, n, i, s) { if (!e) return _; var a = 1; if (t === g && (t = 6), n < 0 ? (a = 0, n = -n) : 15 < n && (a = 2, n -= 16), i < 1 || y < i || r !== v || n < 8 || 15 < n || t < 0 || 9 < t || s < 0 || b < s) return R(e, _); 8 === n && (n = 9); var o = new H; return (e.state = o).strm = e, o.wrap = a, o.gzhead = null, o.w_bits = n, o.w_size = 1 << o.w_bits, o.w_mask = o.w_size - 1, o.hash_bits = i + 7, o.hash_size = 1 << o.hash_bits, o.hash_mask = o.hash_size - 1, o.hash_shift = ~~((o.hash_bits + x - 1) / x), o.window = new c.Buf8(2 * o.w_size), o.head = new c.Buf16(o.hash_size), o.prev = new c.Buf16(o.w_size), o.lit_bufsize = 1 << i + 6, o.pending_buf_size = 4 * o.lit_bufsize, o.pending_buf = new c.Buf8(o.pending_buf_size), o.d_buf = 1 * o.lit_bufsize, o.l_buf = 3 * o.lit_bufsize, o.level = t, o.strategy = s, o.method = r, K(e) } h = [new M(0, 0, 0, 0, function (e, t) { var r = 65535; for (r > e.pending_buf_size - 5 && (r = e.pending_buf_size - 5); ;) { if (e.lookahead <= 1) { if (j(e), 0 === e.lookahead && t === l) return A; if (0 === e.lookahead) break } e.strstart += e.lookahead, e.lookahead = 0; var n = e.block_start + r; if ((0 === e.strstart || e.strstart >= n) && (e.lookahead = e.strstart - n, e.strstart = n, N(e, !1), 0 === e.strm.avail_out)) return A; if (e.strstart - e.block_start >= e.w_size - z && (N(e, !1), 0 === e.strm.avail_out)) return A } return e.insert = 0, t === f ? (N(e, !0), 0 === e.strm.avail_out ? O : B) : (e.strstart > e.block_start && (N(e, !1), e.strm.avail_out), A) }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function (e, t) { return Y(e, t, v, 15, 8, 0) }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function (e, t) { return e && e.state ? 2 !== e.state.wrap ? _ : (e.state.gzhead = t, m) : _ }, r.deflate = function (e, t) { var r, n, i, s; if (!e || !e.state || 5 < t || t < 0) return e ? R(e, _) : _; if (n = e.state, !e.output || !e.input && 0 !== e.avail_in || 666 === n.status && t !== f) return R(e, 0 === e.avail_out ? -5 : _); if (n.strm = e, r = n.last_flush, n.last_flush = t, n.status === C) if (2 === n.wrap) e.adler = 0, U(n, 31), U(n, 139), U(n, 8), n.gzhead ? (U(n, (n.gzhead.text ? 1 : 0) + (n.gzhead.hcrc ? 2 : 0) + (n.gzhead.extra ? 4 : 0) + (n.gzhead.name ? 8 : 0) + (n.gzhead.comment ? 16 : 0)), U(n, 255 & n.gzhead.time), U(n, n.gzhead.time >> 8 & 255), U(n, n.gzhead.time >> 16 & 255), U(n, n.gzhead.time >> 24 & 255), U(n, 9 === n.level ? 2 : 2 <= n.strategy || n.level < 2 ? 4 : 0), U(n, 255 & n.gzhead.os), n.gzhead.extra && n.gzhead.extra.length && (U(n, 255 & n.gzhead.extra.length), U(n, n.gzhead.extra.length >> 8 & 255)), n.gzhead.hcrc && (e.adler = p(e.adler, n.pending_buf, n.pending, 0)), n.gzindex = 0, n.status = 69) : (U(n, 0), U(n, 0), U(n, 0), U(n, 0), U(n, 0), U(n, 9 === n.level ? 2 : 2 <= n.strategy || n.level < 2 ? 4 : 0), U(n, 3), n.status = E); else { var a = v + (n.w_bits - 8 << 4) << 8; a |= (2 <= n.strategy || n.level < 2 ? 0 : n.level < 6 ? 1 : 6 === n.level ? 2 : 3) << 6, 0 !== n.strstart && (a |= 32), a += 31 - a % 31, n.status = E, P(n, a), 0 !== n.strstart && (P(n, e.adler >>> 16), P(n, 65535 & e.adler)), e.adler = 1 } if (69 === n.status) if (n.gzhead.extra) { for (i = n.pending; n.gzindex < (65535 & n.gzhead.extra.length) && (n.pending !== n.pending_buf_size || (n.gzhead.hcrc && n.pending > i && (e.adler = p(e.adler, n.pending_buf, n.pending - i, i)), F(e), i = n.pending, n.pending !== n.pending_buf_size));)U(n, 255 & n.gzhead.extra[n.gzindex]), n.gzindex++; n.gzhead.hcrc && n.pending > i && (e.adler = p(e.adler, n.pending_buf, n.pending - i, i)), n.gzindex === n.gzhead.extra.length && (n.gzindex = 0, n.status = 73) } else n.status = 73; if (73 === n.status) if (n.gzhead.name) { i = n.pending; do { if (n.pending === n.pending_buf_size && (n.gzhead.hcrc && n.pending > i && (e.adler = p(e.adler, n.pending_buf, n.pending - i, i)), F(e), i = n.pending, n.pending === n.pending_buf_size)) { s = 1; break } s = n.gzindex < n.gzhead.name.length ? 255 & n.gzhead.name.charCodeAt(n.gzindex++) : 0, U(n, s) } while (0 !== s); n.gzhead.hcrc && n.pending > i && (e.adler = p(e.adler, n.pending_buf, n.pending - i, i)), 0 === s && (n.gzindex = 0, n.status = 91) } else n.status = 91; if (91 === n.status) if (n.gzhead.comment) { i = n.pending; do { if (n.pending === n.pending_buf_size && (n.gzhead.hcrc && n.pending > i && (e.adler = p(e.adler, n.pending_buf, n.pending - i, i)), F(e), i = n.pending, n.pending === n.pending_buf_size)) { s = 1; break } s = n.gzindex < n.gzhead.comment.length ? 255 & n.gzhead.comment.charCodeAt(n.gzindex++) : 0, U(n, s) } while (0 !== s); n.gzhead.hcrc && n.pending > i && (e.adler = p(e.adler, n.pending_buf, n.pending - i, i)), 0 === s && (n.status = 103) } else n.status = 103; if (103 === n.status && (n.gzhead.hcrc ? (n.pending + 2 > n.pending_buf_size && F(e), n.pending + 2 <= n.pending_buf_size && (U(n, 255 & e.adler), U(n, e.adler >> 8 & 255), e.adler = 0, n.status = E)) : n.status = E), 0 !== n.pending) { if (F(e), 0 === e.avail_out) return n.last_flush = -1, m } else if (0 === e.avail_in && T(t) <= T(r) && t !== f) return R(e, -5); if (666 === n.status && 0 !== e.avail_in) return R(e, -5); if (0 !== e.avail_in || 0 !== n.lookahead || t !== l && 666 !== n.status) { var o = 2 === n.strategy ? function (e, t) { for (var r; ;) { if (0 === e.lookahead && (j(e), 0 === e.lookahead)) { if (t === l) return A; break } if (e.match_length = 0, r = u._tr_tally(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++, r && (N(e, !1), 0 === e.strm.avail_out)) return A } return e.insert = 0, t === f ? (N(e, !0), 0 === e.strm.avail_out ? O : B) : e.last_lit && (N(e, !1), 0 === e.strm.avail_out) ? A : I }(n, t) : 3 === n.strategy ? function (e, t) { for (var r, n, i, s, a = e.window; ;) { if (e.lookahead <= S) { if (j(e), e.lookahead <= S && t === l) return A; if (0 === e.lookahead) break } if (e.match_length = 0, e.lookahead >= x && 0 < e.strstart && (n = a[i = e.strstart - 1]) === a[++i] && n === a[++i] && n === a[++i]) { s = e.strstart + S; do { } while (n === a[++i] && n === a[++i] && n === a[++i] && n === a[++i] && n === a[++i] && n === a[++i] && n === a[++i] && n === a[++i] && i < s); e.match_length = S - (s - i), e.match_length > e.lookahead && (e.match_length = e.lookahead) } if (e.match_length >= x ? (r = u._tr_tally(e, 1, e.match_length - x), e.lookahead -= e.match_length, e.strstart += e.match_length, e.match_length = 0) : (r = u._tr_tally(e, 0, e.window[e.strstart]), e.lookahead--, e.strstart++), r && (N(e, !1), 0 === e.strm.avail_out)) return A } return e.insert = 0, t === f ? (N(e, !0), 0 === e.strm.avail_out ? O : B) : e.last_lit && (N(e, !1), 0 === e.strm.avail_out) ? A : I }(n, t) : h[n.level].func(n, t); if (o !== O && o !== B || (n.status = 666), o === A || o === O) return 0 === e.avail_out && (n.last_flush = -1), m; if (o === I && (1 === t ? u._tr_align(n) : 5 !== t && (u._tr_stored_block(n, 0, 0, !1), 3 === t && (D(n.head), 0 === n.lookahead && (n.strstart = 0, n.block_start = 0, n.insert = 0))), F(e), 0 === e.avail_out)) return n.last_flush = -1, m } return t !== f ? m : n.wrap <= 0 ? 1 : (2 === n.wrap ? (U(n, 255 & e.adler), U(n, e.adler >> 8 & 255), U(n, e.adler >> 16 & 255), U(n, e.adler >> 24 & 255), U(n, 255 & e.total_in), U(n, e.total_in >> 8 & 255), U(n, e.total_in >> 16 & 255), U(n, e.total_in >> 24 & 255)) : (P(n, e.adler >>> 16), P(n, 65535 & e.adler)), F(e), 0 < n.wrap && (n.wrap = -n.wrap), 0 !== n.pending ? m : 1) }, r.deflateEnd = function (e) { var t; return e && e.state ? (t = e.state.status) !== C && 69 !== t && 73 !== t && 91 !== t && 103 !== t && t !== E && 666 !== t ? R(e, _) : (e.state = null, t === E ? R(e, -3) : m) : _ }, r.deflateSetDictionary = function (e, t) { var r, n, i, s, a, o, h, u, l = t.length; if (!e || !e.state) return _; if (2 === (s = (r = e.state).wrap) || 1 === s && r.status !== C || r.lookahead) return _; for (1 === s && (e.adler = d(e.adler, t, l, 0)), r.wrap = 0, l >= r.w_size && (0 === s && (D(r.head), r.strstart = 0, r.block_start = 0, r.insert = 0), u = new c.Buf8(r.w_size), c.arraySet(u, t, l - r.w_size, r.w_size, 0), t = u, l = r.w_size), a = e.avail_in, o = e.next_in, h = e.input, e.avail_in = l, e.next_in = 0, e.input = t, j(r); r.lookahead >= x;) { for (n = r.strstart, i = r.lookahead - (x - 1); r.ins_h = (r.ins_h << r.hash_shift ^ r.window[n + x - 1]) & r.hash_mask, r.prev[n & r.w_mask] = r.head[r.ins_h], r.head[r.ins_h] = n, n++, --i;); r.strstart = n, r.lookahead = x - 1, j(r) } return r.strstart += r.lookahead, r.block_start = r.strstart, r.insert = r.lookahead, r.lookahead = 0, r.match_length = r.prev_length = x - 1, r.match_available = 0, e.next_in = o, e.input = h, e.avail_in = a, r.wrap = s, m }, r.deflateInfo = "pako deflate (from Nodeca project)" }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function (e, t, r) { "use strict"; t.exports = function () { this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = !1 } }, {}], 48: [function (e, t, r) { "use strict"; t.exports = function (e, t) { var r, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C; r = e.state, n = e.next_in, z = e.input, i = n + (e.avail_in - 5), s = e.next_out, C = e.output, a = s - (t - e.avail_out), o = s + (e.avail_out - 257), h = r.dmax, u = r.wsize, l = r.whave, f = r.wnext, c = r.window, d = r.hold, p = r.bits, m = r.lencode, _ = r.distcode, g = (1 << r.lenbits) - 1, b = (1 << r.distbits) - 1; e: do { p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = m[d & g]; t: for (; ;) { if (d >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255)) C[s++] = 65535 & v; else { if (!(16 & y)) { if (0 == (64 & y)) { v = m[(65535 & v) + (d & (1 << y) - 1)]; continue t } if (32 & y) { r.mode = 12; break e } e.msg = "invalid literal/length code", r.mode = 30; break e } w = 65535 & v, (y &= 15) && (p < y && (d += z[n++] << p, p += 8), w += d & (1 << y) - 1, d >>>= y, p -= y), p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = _[d & b]; r: for (; ;) { if (d >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) { if (0 == (64 & y)) { v = _[(65535 & v) + (d & (1 << y) - 1)]; continue r } e.msg = "invalid distance code", r.mode = 30; break e } if (k = 65535 & v, p < (y &= 15) && (d += z[n++] << p, (p += 8) < y && (d += z[n++] << p, p += 8)), h < (k += d & (1 << y) - 1)) { e.msg = "invalid distance too far back", r.mode = 30; break e } if (d >>>= y, p -= y, (y = s - a) < k) { if (l < (y = k - y) && r.sane) { e.msg = "invalid distance too far back", r.mode = 30; break e } if (S = c, (x = 0) === f) { if (x += u - y, y < w) { for (w -= y; C[s++] = c[x++], --y;); x = s - k, S = C } } else if (f < y) { if (x += u + f - y, (y -= f) < w) { for (w -= y; C[s++] = c[x++], --y;); if (x = 0, f < w) { for (w -= y = f; C[s++] = c[x++], --y;); x = s - k, S = C } } } else if (x += f - y, y < w) { for (w -= y; C[s++] = c[x++], --y;); x = s - k, S = C } for (; 2 < w;)C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3; w && (C[s++] = S[x++], 1 < w && (C[s++] = S[x++])) } else { for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3);); w && (C[s++] = C[x++], 1 < w && (C[s++] = C[x++])) } break } } break } } while (n < i && s < o); n -= w = p >> 3, d &= (1 << (p -= w << 3)) - 1, e.next_in = n, e.next_out = s, e.avail_in = n < i ? i - n + 5 : 5 - (n - i), e.avail_out = s < o ? o - s + 257 : 257 - (s - o), r.hold = d, r.bits = p } }, {}], 49: [function (e, t, r) { "use strict"; var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592; function L(e) { return (e >>> 24 & 255) + (e >>> 8 & 65280) + ((65280 & e) << 8) + ((255 & e) << 24) } function s() { this.mode = 0, this.last = !1, this.wrap = 0, this.havedict = !1, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0 } function a(e) { var t; return e && e.state ? (t = e.state, e.total_in = e.total_out = t.total = 0, e.msg = "", t.wrap && (e.adler = 1 & t.wrap), t.mode = P, t.last = 0, t.havedict = 0, t.dmax = 32768, t.head = null, t.hold = 0, t.bits = 0, t.lencode = t.lendyn = new I.Buf32(n), t.distcode = t.distdyn = new I.Buf32(i), t.sane = 1, t.back = -1, N) : U } function o(e) { var t; return e && e.state ? ((t = e.state).wsize = 0, t.whave = 0, t.wnext = 0, a(e)) : U } function h(e, t) { var r, n; return e && e.state ? (n = e.state, t < 0 ? (r = 0, t = -t) : (r = 1 + (t >> 4), t < 48 && (t &= 15)), t && (t < 8 || 15 < t) ? U : (null !== n.window && n.wbits !== t && (n.window = null), n.wrap = r, n.wbits = t, o(e))) : U } function u(e, t) { var r, n; return e ? (n = new s, (e.state = n).window = null, (r = h(e, t)) !== N && (e.state = null), r) : U } var l, f, c = !0; function j(e) { if (c) { var t; for (l = new I.Buf32(512), f = new I.Buf32(32), t = 0; t < 144;)e.lens[t++] = 8; for (; t < 256;)e.lens[t++] = 9; for (; t < 280;)e.lens[t++] = 7; for (; t < 288;)e.lens[t++] = 8; for (T(D, e.lens, 0, 288, l, 0, e.work, { bits: 9 }), t = 0; t < 32;)e.lens[t++] = 5; T(F, e.lens, 0, 32, f, 0, e.work, { bits: 5 }), c = !1 } e.lencode = l, e.lenbits = 9, e.distcode = f, e.distbits = 5 } function Z(e, t, r, n) { var i, s = e.state; return null === s.window && (s.wsize = 1 << s.wbits, s.wnext = 0, s.whave = 0, s.window = new I.Buf8(s.wsize)), n >= s.wsize ? (I.arraySet(s.window, t, r - s.wsize, s.wsize, 0), s.wnext = 0, s.whave = s.wsize) : (n < (i = s.wsize - s.wnext) && (i = n), I.arraySet(s.window, t, r - n, i, s.wnext), (n -= i) ? (I.arraySet(s.window, t, r - n, n, 0), s.wnext = n, s.whave = s.wsize) : (s.wnext += i, s.wnext === s.wsize && (s.wnext = 0), s.whave < s.wsize && (s.whave += i))), 0 } r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function (e) { return u(e, 15) }, r.inflateInit2 = u, r.inflate = function (e, t) { var r, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]; if (!e || !e.state || !e.output || !e.input && 0 !== e.avail_in) return U; 12 === (r = e.state).mode && (r.mode = 13), a = e.next_out, i = e.output, h = e.avail_out, s = e.next_in, n = e.input, o = e.avail_in, u = r.hold, l = r.bits, f = o, c = h, x = N; e: for (; ;)switch (r.mode) { case P: if (0 === r.wrap) { r.mode = 13; break } for (; l < 16;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } if (2 & r.wrap && 35615 === u) { E[r.check = 0] = 255 & u, E[1] = u >>> 8 & 255, r.check = B(r.check, E, 2, 0), l = u = 0, r.mode = 2; break } if (r.flags = 0, r.head && (r.head.done = !1), !(1 & r.wrap) || (((255 & u) << 8) + (u >> 8)) % 31) { e.msg = "incorrect header check", r.mode = 30; break } if (8 != (15 & u)) { e.msg = "unknown compression method", r.mode = 30; break } if (l -= 4, k = 8 + (15 & (u >>>= 4)), 0 === r.wbits) r.wbits = k; else if (k > r.wbits) { e.msg = "invalid window size", r.mode = 30; break } r.dmax = 1 << k, e.adler = r.check = 1, r.mode = 512 & u ? 10 : 12, l = u = 0; break; case 2: for (; l < 16;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } if (r.flags = u, 8 != (255 & r.flags)) { e.msg = "unknown compression method", r.mode = 30; break } if (57344 & r.flags) { e.msg = "unknown header flags set", r.mode = 30; break } r.head && (r.head.text = u >> 8 & 1), 512 & r.flags && (E[0] = 255 & u, E[1] = u >>> 8 & 255, r.check = B(r.check, E, 2, 0)), l = u = 0, r.mode = 3; case 3: for (; l < 32;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } r.head && (r.head.time = u), 512 & r.flags && (E[0] = 255 & u, E[1] = u >>> 8 & 255, E[2] = u >>> 16 & 255, E[3] = u >>> 24 & 255, r.check = B(r.check, E, 4, 0)), l = u = 0, r.mode = 4; case 4: for (; l < 16;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } r.head && (r.head.xflags = 255 & u, r.head.os = u >> 8), 512 & r.flags && (E[0] = 255 & u, E[1] = u >>> 8 & 255, r.check = B(r.check, E, 2, 0)), l = u = 0, r.mode = 5; case 5: if (1024 & r.flags) { for (; l < 16;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } r.length = u, r.head && (r.head.extra_len = u), 512 & r.flags && (E[0] = 255 & u, E[1] = u >>> 8 & 255, r.check = B(r.check, E, 2, 0)), l = u = 0 } else r.head && (r.head.extra = null); r.mode = 6; case 6: if (1024 & r.flags && (o < (d = r.length) && (d = o), d && (r.head && (k = r.head.extra_len - r.length, r.head.extra || (r.head.extra = new Array(r.head.extra_len)), I.arraySet(r.head.extra, n, s, d, k)), 512 & r.flags && (r.check = B(r.check, n, d, s)), o -= d, s += d, r.length -= d), r.length)) break e; r.length = 0, r.mode = 7; case 7: if (2048 & r.flags) { if (0 === o) break e; for (d = 0; k = n[s + d++], r.head && k && r.length < 65536 && (r.head.name += String.fromCharCode(k)), k && d < o;); if (512 & r.flags && (r.check = B(r.check, n, d, s)), o -= d, s += d, k) break e } else r.head && (r.head.name = null); r.length = 0, r.mode = 8; case 8: if (4096 & r.flags) { if (0 === o) break e; for (d = 0; k = n[s + d++], r.head && k && r.length < 65536 && (r.head.comment += String.fromCharCode(k)), k && d < o;); if (512 & r.flags && (r.check = B(r.check, n, d, s)), o -= d, s += d, k) break e } else r.head && (r.head.comment = null); r.mode = 9; case 9: if (512 & r.flags) { for (; l < 16;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } if (u !== (65535 & r.check)) { e.msg = "header crc mismatch", r.mode = 30; break } l = u = 0 } r.head && (r.head.hcrc = r.flags >> 9 & 1, r.head.done = !0), e.adler = r.check = 0, r.mode = 12; break; case 10: for (; l < 32;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } e.adler = r.check = L(u), l = u = 0, r.mode = 11; case 11: if (0 === r.havedict) return e.next_out = a, e.avail_out = h, e.next_in = s, e.avail_in = o, r.hold = u, r.bits = l, 2; e.adler = r.check = 1, r.mode = 12; case 12: if (5 === t || 6 === t) break e; case 13: if (r.last) { u >>>= 7 & l, l -= 7 & l, r.mode = 27; break } for (; l < 3;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } switch (r.last = 1 & u, l -= 1, 3 & (u >>>= 1)) { case 0: r.mode = 14; break; case 1: if (j(r), r.mode = 20, 6 !== t) break; u >>>= 2, l -= 2; break e; case 2: r.mode = 17; break; case 3: e.msg = "invalid block type", r.mode = 30 }u >>>= 2, l -= 2; break; case 14: for (u >>>= 7 & l, l -= 7 & l; l < 32;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } if ((65535 & u) != (u >>> 16 ^ 65535)) { e.msg = "invalid stored block lengths", r.mode = 30; break } if (r.length = 65535 & u, l = u = 0, r.mode = 15, 6 === t) break e; case 15: r.mode = 16; case 16: if (d = r.length) { if (o < d && (d = o), h < d && (d = h), 0 === d) break e; I.arraySet(i, n, s, d, a), o -= d, s += d, h -= d, a += d, r.length -= d; break } r.mode = 12; break; case 17: for (; l < 14;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } if (r.nlen = 257 + (31 & u), u >>>= 5, l -= 5, r.ndist = 1 + (31 & u), u >>>= 5, l -= 5, r.ncode = 4 + (15 & u), u >>>= 4, l -= 4, 286 < r.nlen || 30 < r.ndist) { e.msg = "too many length or distance symbols", r.mode = 30; break } r.have = 0, r.mode = 18; case 18: for (; r.have < r.ncode;) { for (; l < 3;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } r.lens[A[r.have++]] = 7 & u, u >>>= 3, l -= 3 } for (; r.have < 19;)r.lens[A[r.have++]] = 0; if (r.lencode = r.lendyn, r.lenbits = 7, S = { bits: r.lenbits }, x = T(0, r.lens, 0, 19, r.lencode, 0, r.work, S), r.lenbits = S.bits, x) { e.msg = "invalid code lengths set", r.mode = 30; break } r.have = 0, r.mode = 19; case 19: for (; r.have < r.nlen + r.ndist;) { for (; g = (C = r.lencode[u & (1 << r.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l);) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } if (b < 16) u >>>= _, l -= _, r.lens[r.have++] = b; else { if (16 === b) { for (z = _ + 2; l < z;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } if (u >>>= _, l -= _, 0 === r.have) { e.msg = "invalid bit length repeat", r.mode = 30; break } k = r.lens[r.have - 1], d = 3 + (3 & u), u >>>= 2, l -= 2 } else if (17 === b) { for (z = _ + 3; l < z;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } l -= _, k = 0, d = 3 + (7 & (u >>>= _)), u >>>= 3, l -= 3 } else { for (z = _ + 7; l < z;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } l -= _, k = 0, d = 11 + (127 & (u >>>= _)), u >>>= 7, l -= 7 } if (r.have + d > r.nlen + r.ndist) { e.msg = "invalid bit length repeat", r.mode = 30; break } for (; d--;)r.lens[r.have++] = k } } if (30 === r.mode) break; if (0 === r.lens[256]) { e.msg = "invalid code -- missing end-of-block", r.mode = 30; break } if (r.lenbits = 9, S = { bits: r.lenbits }, x = T(D, r.lens, 0, r.nlen, r.lencode, 0, r.work, S), r.lenbits = S.bits, x) { e.msg = "invalid literal/lengths set", r.mode = 30; break } if (r.distbits = 6, r.distcode = r.distdyn, S = { bits: r.distbits }, x = T(F, r.lens, r.nlen, r.ndist, r.distcode, 0, r.work, S), r.distbits = S.bits, x) { e.msg = "invalid distances set", r.mode = 30; break } if (r.mode = 20, 6 === t) break e; case 20: r.mode = 21; case 21: if (6 <= o && 258 <= h) { e.next_out = a, e.avail_out = h, e.next_in = s, e.avail_in = o, r.hold = u, r.bits = l, R(e, c), a = e.next_out, i = e.output, h = e.avail_out, s = e.next_in, n = e.input, o = e.avail_in, u = r.hold, l = r.bits, 12 === r.mode && (r.back = -1); break } for (r.back = 0; g = (C = r.lencode[u & (1 << r.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l);) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } if (g && 0 == (240 & g)) { for (v = _, y = g, w = b; g = (C = r.lencode[w + ((u & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l);) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } u >>>= v, l -= v, r.back += v } if (u >>>= _, l -= _, r.back += _, r.length = b, 0 === g) { r.mode = 26; break } if (32 & g) { r.back = -1, r.mode = 12; break } if (64 & g) { e.msg = "invalid literal/length code", r.mode = 30; break } r.extra = 15 & g, r.mode = 22; case 22: if (r.extra) { for (z = r.extra; l < z;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } r.length += u & (1 << r.extra) - 1, u >>>= r.extra, l -= r.extra, r.back += r.extra } r.was = r.length, r.mode = 23; case 23: for (; g = (C = r.distcode[u & (1 << r.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l);) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } if (0 == (240 & g)) { for (v = _, y = g, w = b; g = (C = r.distcode[w + ((u & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l);) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } u >>>= v, l -= v, r.back += v } if (u >>>= _, l -= _, r.back += _, 64 & g) { e.msg = "invalid distance code", r.mode = 30; break } r.offset = b, r.extra = 15 & g, r.mode = 24; case 24: if (r.extra) { for (z = r.extra; l < z;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } r.offset += u & (1 << r.extra) - 1, u >>>= r.extra, l -= r.extra, r.back += r.extra } if (r.offset > r.dmax) { e.msg = "invalid distance too far back", r.mode = 30; break } r.mode = 25; case 25: if (0 === h) break e; if (d = c - h, r.offset > d) { if ((d = r.offset - d) > r.whave && r.sane) { e.msg = "invalid distance too far back", r.mode = 30; break } p = d > r.wnext ? (d -= r.wnext, r.wsize - d) : r.wnext - d, d > r.length && (d = r.length), m = r.window } else m = i, p = a - r.offset, d = r.length; for (h < d && (d = h), h -= d, r.length -= d; i[a++] = m[p++], --d;); 0 === r.length && (r.mode = 21); break; case 26: if (0 === h) break e; i[a++] = r.length, h--, r.mode = 21; break; case 27: if (r.wrap) { for (; l < 32;) { if (0 === o) break e; o--, u |= n[s++] << l, l += 8 } if (c -= h, e.total_out += c, r.total += c, c && (e.adler = r.check = r.flags ? B(r.check, i, c, a - c) : O(r.check, i, c, a - c)), c = h, (r.flags ? u : L(u)) !== r.check) { e.msg = "incorrect data check", r.mode = 30; break } l = u = 0 } r.mode = 28; case 28: if (r.wrap && r.flags) { for (; l < 32;) { if (0 === o) break e; o--, u += n[s++] << l, l += 8 } if (u !== (4294967295 & r.total)) { e.msg = "incorrect length check", r.mode = 30; break } l = u = 0 } r.mode = 29; case 29: x = 1; break e; case 30: x = -3; break e; case 31: return -4; case 32: default: return U }return e.next_out = a, e.avail_out = h, e.next_in = s, e.avail_in = o, r.hold = u, r.bits = l, (r.wsize || c !== e.avail_out && r.mode < 30 && (r.mode < 27 || 4 !== t)) && Z(e, e.output, e.next_out, c - e.avail_out) ? (r.mode = 31, -4) : (f -= e.avail_in, c -= e.avail_out, e.total_in += f, e.total_out += c, r.total += c, r.wrap && c && (e.adler = r.check = r.flags ? B(r.check, i, c, e.next_out - c) : O(r.check, i, c, e.next_out - c)), e.data_type = r.bits + (r.last ? 64 : 0) + (12 === r.mode ? 128 : 0) + (20 === r.mode || 15 === r.mode ? 256 : 0), (0 == f && 0 === c || 4 === t) && x === N && (x = -5), x) }, r.inflateEnd = function (e) { if (!e || !e.state) return U; var t = e.state; return t.window && (t.window = null), e.state = null, N }, r.inflateGetHeader = function (e, t) { var r; return e && e.state ? 0 == (2 & (r = e.state).wrap) ? U : ((r.head = t).done = !1, N) : U }, r.inflateSetDictionary = function (e, t) { var r, n = t.length; return e && e.state ? 0 !== (r = e.state).wrap && 11 !== r.mode ? U : 11 === r.mode && O(1, t, n, 0) !== r.check ? -3 : Z(e, t, n, n) ? (r.mode = 31, -4) : (r.havedict = 1, N) : U }, r.inflateInfo = "pako inflate (from Nodeca project)" }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function (e, t, r) { "use strict"; var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64]; t.exports = function (e, t, r, n, i, s, a, o) { var h, u, l, f, c, d, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0; for (b = 0; b <= 15; b++)O[b] = 0; for (v = 0; v < n; v++)O[t[r + v]]++; for (k = g, w = 15; 1 <= w && 0 === O[w]; w--); if (w < k && (k = w), 0 === w) return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0; for (y = 1; y < w && 0 === O[y]; y++); for (k < y && (k = y), b = z = 1; b <= 15; b++)if (z <<= 1, (z -= O[b]) < 0) return -1; if (0 < z && (0 === e || 1 !== w)) return -1; for (B[1] = 0, b = 1; b < 15; b++)B[b + 1] = B[b] + O[b]; for (v = 0; v < n; v++)0 !== t[r + v] && (a[B[t[r + v]]++] = v); if (d = 0 === e ? (A = R = a, 19) : 1 === e ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === e && 852 < C || 2 === e && 592 < C) return 1; for (; ;) { for (p = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u;); for (h = 1 << b - 1; E & h;)h >>= 1; if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) { if (b === w) break; b = t[r + a[v]] } if (k < b && (E & f) !== l) { for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0);)x++, z <<= 1; if (C += 1 << x, 1 === e && 852 < C || 2 === e && 592 < C) return 1; i[l = E & f] = k << 24 | x << 16 | c - s | 0 } } return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0 } }, { "../utils/common": 41 }], 51: [function (e, t, r) { "use strict"; t.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" } }, {}], 52: [function (e, t, r) { "use strict"; var i = e("../utils/common"), o = 0, h = 1; function n(e) { for (var t = e.length; 0 <= --t;)e[t] = 0 } var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2)); n(z); var C = new Array(2 * f); n(C); var E = new Array(512); n(E); var A = new Array(256); n(A); var I = new Array(a); n(I); var O, B, R, T = new Array(f); function D(e, t, r, n, i) { this.static_tree = e, this.extra_bits = t, this.extra_base = r, this.elems = n, this.max_length = i, this.has_stree = e && e.length } function F(e, t) { this.dyn_tree = e, this.max_code = 0, this.stat_desc = t } function N(e) { return e < 256 ? E[e] : E[256 + (e >>> 7)] } function U(e, t) { e.pending_buf[e.pending++] = 255 & t, e.pending_buf[e.pending++] = t >>> 8 & 255 } function P(e, t, r) { e.bi_valid > d - r ? (e.bi_buf |= t << e.bi_valid & 65535, U(e, e.bi_buf), e.bi_buf = t >> d - e.bi_valid, e.bi_valid += r - d) : (e.bi_buf |= t << e.bi_valid & 65535, e.bi_valid += r) } function L(e, t, r) { P(e, r[2 * t], r[2 * t + 1]) } function j(e, t) { for (var r = 0; r |= 1 & e, e >>>= 1, r <<= 1, 0 < --t;); return r >>> 1 } function Z(e, t, r) { var n, i, s = new Array(g + 1), a = 0; for (n = 1; n <= g; n++)s[n] = a = a + r[n - 1] << 1; for (i = 0; i <= t; i++) { var o = e[2 * i + 1]; 0 !== o && (e[2 * i] = j(s[o]++, o)) } } function W(e) { var t; for (t = 0; t < l; t++)e.dyn_ltree[2 * t] = 0; for (t = 0; t < f; t++)e.dyn_dtree[2 * t] = 0; for (t = 0; t < c; t++)e.bl_tree[2 * t] = 0; e.dyn_ltree[2 * m] = 1, e.opt_len = e.static_len = 0, e.last_lit = e.matches = 0 } function M(e) { 8 < e.bi_valid ? U(e, e.bi_buf) : 0 < e.bi_valid && (e.pending_buf[e.pending++] = e.bi_buf), e.bi_buf = 0, e.bi_valid = 0 } function H(e, t, r, n) { var i = 2 * t, s = 2 * r; return e[i] < e[s] || e[i] === e[s] && n[t] <= n[r] } function G(e, t, r) { for (var n = e.heap[r], i = r << 1; i <= e.heap_len && (i < e.heap_len && H(t, e.heap[i + 1], e.heap[i], e.depth) && i++, !H(t, n, e.heap[i], e.depth));)e.heap[r] = e.heap[i], r = i, i <<= 1; e.heap[r] = n } function K(e, t, r) { var n, i, s, a, o = 0; if (0 !== e.last_lit) for (; n = e.pending_buf[e.d_buf + 2 * o] << 8 | e.pending_buf[e.d_buf + 2 * o + 1], i = e.pending_buf[e.l_buf + o], o++, 0 === n ? L(e, i, t) : (L(e, (s = A[i]) + u + 1, t), 0 !== (a = w[s]) && P(e, i -= I[s], a), L(e, s = N(--n), r), 0 !== (a = k[s]) && P(e, n -= T[s], a)), o < e.last_lit;); L(e, m, t) } function Y(e, t) { var r, n, i, s = t.dyn_tree, a = t.stat_desc.static_tree, o = t.stat_desc.has_stree, h = t.stat_desc.elems, u = -1; for (e.heap_len = 0, e.heap_max = _, r = 0; r < h; r++)0 !== s[2 * r] ? (e.heap[++e.heap_len] = u = r, e.depth[r] = 0) : s[2 * r + 1] = 0; for (; e.heap_len < 2;)s[2 * (i = e.heap[++e.heap_len] = u < 2 ? ++u : 0)] = 1, e.depth[i] = 0, e.opt_len--, o && (e.static_len -= a[2 * i + 1]); for (t.max_code = u, r = e.heap_len >> 1; 1 <= r; r--)G(e, s, r); for (i = h; r = e.heap[1], e.heap[1] = e.heap[e.heap_len--], G(e, s, 1), n = e.heap[1], e.heap[--e.heap_max] = r, e.heap[--e.heap_max] = n, s[2 * i] = s[2 * r] + s[2 * n], e.depth[i] = (e.depth[r] >= e.depth[n] ? e.depth[r] : e.depth[n]) + 1, s[2 * r + 1] = s[2 * n + 1] = i, e.heap[1] = i++, G(e, s, 1), 2 <= e.heap_len;); e.heap[--e.heap_max] = e.heap[1], function (e, t) { var r, n, i, s, a, o, h = t.dyn_tree, u = t.max_code, l = t.stat_desc.static_tree, f = t.stat_desc.has_stree, c = t.stat_desc.extra_bits, d = t.stat_desc.extra_base, p = t.stat_desc.max_length, m = 0; for (s = 0; s <= g; s++)e.bl_count[s] = 0; for (h[2 * e.heap[e.heap_max] + 1] = 0, r = e.heap_max + 1; r < _; r++)p < (s = h[2 * h[2 * (n = e.heap[r]) + 1] + 1] + 1) && (s = p, m++), h[2 * n + 1] = s, u < n || (e.bl_count[s]++, a = 0, d <= n && (a = c[n - d]), o = h[2 * n], e.opt_len += o * (s + a), f && (e.static_len += o * (l[2 * n + 1] + a))); if (0 !== m) { do { for (s = p - 1; 0 === e.bl_count[s];)s--; e.bl_count[s]--, e.bl_count[s + 1] += 2, e.bl_count[p]--, m -= 2 } while (0 < m); for (s = p; 0 !== s; s--)for (n = e.bl_count[s]; 0 !== n;)u < (i = e.heap[--r]) || (h[2 * i + 1] !== s && (e.opt_len += (s - h[2 * i + 1]) * h[2 * i], h[2 * i + 1] = s), n--) } }(e, t), Z(s, u, e.bl_count) } function X(e, t, r) { var n, i, s = -1, a = t[1], o = 0, h = 7, u = 4; for (0 === a && (h = 138, u = 3), t[2 * (r + 1) + 1] = 65535, n = 0; n <= r; n++)i = a, a = t[2 * (n + 1) + 1], ++o < h && i === a || (o < u ? e.bl_tree[2 * i] += o : 0 !== i ? (i !== s && e.bl_tree[2 * i]++, e.bl_tree[2 * b]++) : o <= 10 ? e.bl_tree[2 * v]++ : e.bl_tree[2 * y]++, s = i, u = (o = 0) === a ? (h = 138, 3) : i === a ? (h = 6, 3) : (h = 7, 4)) } function V(e, t, r) { var n, i, s = -1, a = t[1], o = 0, h = 7, u = 4; for (0 === a && (h = 138, u = 3), n = 0; n <= r; n++)if (i = a, a = t[2 * (n + 1) + 1], !(++o < h && i === a)) { if (o < u) for (; L(e, i, e.bl_tree), 0 != --o;); else 0 !== i ? (i !== s && (L(e, i, e.bl_tree), o--), L(e, b, e.bl_tree), P(e, o - 3, 2)) : o <= 10 ? (L(e, v, e.bl_tree), P(e, o - 3, 3)) : (L(e, y, e.bl_tree), P(e, o - 11, 7)); s = i, u = (o = 0) === a ? (h = 138, 3) : i === a ? (h = 6, 3) : (h = 7, 4) } } n(T); var q = !1; function J(e, t, r, n) { P(e, (s << 1) + (n ? 1 : 0), 3), function (e, t, r, n) { M(e), n && (U(e, r), U(e, ~r)), i.arraySet(e.pending_buf, e.window, t, r, e.pending), e.pending += r }(e, t, r, !0) } r._tr_init = function (e) { q || (function () { var e, t, r, n, i, s = new Array(g + 1); for (n = r = 0; n < a - 1; n++)for (I[n] = r, e = 0; e < 1 << w[n]; e++)A[r++] = n; for (A[r - 1] = n, n = i = 0; n < 16; n++)for (T[n] = i, e = 0; e < 1 << k[n]; e++)E[i++] = n; for (i >>= 7; n < f; n++)for (T[n] = i << 7, e = 0; e < 1 << k[n] - 7; e++)E[256 + i++] = n; for (t = 0; t <= g; t++)s[t] = 0; for (e = 0; e <= 143;)z[2 * e + 1] = 8, e++, s[8]++; for (; e <= 255;)z[2 * e + 1] = 9, e++, s[9]++; for (; e <= 279;)z[2 * e + 1] = 7, e++, s[7]++; for (; e <= 287;)z[2 * e + 1] = 8, e++, s[8]++; for (Z(z, l + 1, s), e = 0; e < f; e++)C[2 * e + 1] = 5, C[2 * e] = j(e, 5); O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, c, p) }(), q = !0), e.l_desc = new F(e.dyn_ltree, O), e.d_desc = new F(e.dyn_dtree, B), e.bl_desc = new F(e.bl_tree, R), e.bi_buf = 0, e.bi_valid = 0, W(e) }, r._tr_stored_block = J, r._tr_flush_block = function (e, t, r, n) { var i, s, a = 0; 0 < e.level ? (2 === e.strm.data_type && (e.strm.data_type = function (e) { var t, r = 4093624447; for (t = 0; t <= 31; t++, r >>>= 1)if (1 & r && 0 !== e.dyn_ltree[2 * t]) return o; if (0 !== e.dyn_ltree[18] || 0 !== e.dyn_ltree[20] || 0 !== e.dyn_ltree[26]) return h; for (t = 32; t < u; t++)if (0 !== e.dyn_ltree[2 * t]) return h; return o }(e)), Y(e, e.l_desc), Y(e, e.d_desc), a = function (e) { var t; for (X(e, e.dyn_ltree, e.l_desc.max_code), X(e, e.dyn_dtree, e.d_desc.max_code), Y(e, e.bl_desc), t = c - 1; 3 <= t && 0 === e.bl_tree[2 * S[t] + 1]; t--); return e.opt_len += 3 * (t + 1) + 5 + 5 + 4, t }(e), i = e.opt_len + 3 + 7 >>> 3, (s = e.static_len + 3 + 7 >>> 3) <= i && (i = s)) : i = s = r + 5, r + 4 <= i && -1 !== t ? J(e, t, r, n) : 4 === e.strategy || s === i ? (P(e, 2 + (n ? 1 : 0), 3), K(e, z, C)) : (P(e, 4 + (n ? 1 : 0), 3), function (e, t, r, n) { var i; for (P(e, t - 257, 5), P(e, r - 1, 5), P(e, n - 4, 4), i = 0; i < n; i++)P(e, e.bl_tree[2 * S[i] + 1], 3); V(e, e.dyn_ltree, t - 1), V(e, e.dyn_dtree, r - 1) }(e, e.l_desc.max_code + 1, e.d_desc.max_code + 1, a + 1), K(e, e.dyn_ltree, e.dyn_dtree)), W(e), n && M(e) }, r._tr_tally = function (e, t, r) { return e.pending_buf[e.d_buf + 2 * e.last_lit] = t >>> 8 & 255, e.pending_buf[e.d_buf + 2 * e.last_lit + 1] = 255 & t, e.pending_buf[e.l_buf + e.last_lit] = 255 & r, e.last_lit++, 0 === t ? e.dyn_ltree[2 * r]++ : (e.matches++, t--, e.dyn_ltree[2 * (A[r] + u + 1)]++, e.dyn_dtree[2 * N(t)]++), e.last_lit === e.lit_bufsize - 1 }, r._tr_align = function (e) { P(e, 2, 3), L(e, m, z), function (e) { 16 === e.bi_valid ? (U(e, e.bi_buf), e.bi_buf = 0, e.bi_valid = 0) : 8 <= e.bi_valid && (e.pending_buf[e.pending++] = 255 & e.bi_buf, e.bi_buf >>= 8, e.bi_valid -= 8) }(e) } }, { "../utils/common": 41 }], 53: [function (e, t, r) { "use strict"; t.exports = function () { this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0 } }, {}], 54: [function (e, t, r) { (function (e) { !function (r, n) { "use strict"; if (!r.setImmediate) { var i, s, t, a, o = 1, h = {}, u = !1, l = r.document, e = Object.getPrototypeOf && Object.getPrototypeOf(r); e = e && e.setTimeout ? e : r, i = "[object process]" === {}.toString.call(r.process) ? function (e) { process.nextTick(function () { c(e) }) } : function () { if (r.postMessage && !r.importScripts) { var e = !0, t = r.onmessage; return r.onmessage = function () { e = !1 }, r.postMessage("", "*"), r.onmessage = t, e } }() ? (a = "setImmediate$" + Math.random() + "$", r.addEventListener ? r.addEventListener("message", d, !1) : r.attachEvent("onmessage", d), function (e) { r.postMessage(a + e, "*") }) : r.MessageChannel ? ((t = new MessageChannel).port1.onmessage = function (e) { c(e.data) }, function (e) { t.port2.postMessage(e) }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function (e) { var t = l.createElement("script"); t.onreadystatechange = function () { c(e), t.onreadystatechange = null, s.removeChild(t), t = null }, s.appendChild(t) }) : function (e) { setTimeout(c, 0, e) }, e.setImmediate = function (e) { "function" != typeof e && (e = new Function("" + e)); for (var t = new Array(arguments.length - 1), r = 0; r < t.length; r++)t[r] = arguments[r + 1]; var n = { callback: e, args: t }; return h[o] = n, i(o), o++ }, e.clearImmediate = f } function f(e) { delete h[e] } function c(e) { if (u) setTimeout(c, 0, e); else { var t = h[e]; if (t) { u = !0; try { !function (e) { var t = e.callback, r = e.args; switch (r.length) { case 0: t(); break; case 1: t(r[0]); break; case 2: t(r[0], r[1]); break; case 3: t(r[0], r[1], r[2]); break; default: t.apply(n, r) } }(t) } finally { f(e), u = !1 } } } } function d(e) { e.source === r && "string" == typeof e.data && 0 === e.data.indexOf(a) && c(+e.data.slice(a.length)) } }("undefined" == typeof self ? void 0 === e ? this : e : self) }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {}) }, {}] }, {}, [10])(10) });
/*! pdfmake v0.2.7, @license MIT, @link http://pdfmake.org */
//# sourceMappingURL=pdfmake.min.js.map
this.pdfMake = this.pdfMake || {}; this.pdfMake.vfs = {
};
/*! Buttons for DataTables 2.3.4
 * ©2016-2023 SpryMedia Ltd - datatables.net/license
 */
!function (e) { "function" == typeof define && define.amd ? define(["jquery", "datatables.net"], function (t) { return e(t, window, document) }) : "object" == typeof exports ? module.exports = function (t, n) { return t = t || window, (n = n || ("undefined" != typeof window ? require("jquery") : require("jquery")(t))).fn.dataTable || require("datatables.net")(t, n), e(n, t, t.document) } : e(jQuery, window, document) }(function (v, m, y, x) { "use strict"; var e = v.fn.dataTable, o = 0, C = 0, w = e.ext.buttons; function _(t, n, e) { v.fn.animate ? t.stop().fadeIn(n, e) : (t.css("display", "block"), e && e.call(t)) } function A(t, n, e) { v.fn.animate ? t.stop().fadeOut(n, e) : (t.css("display", "none"), e && e.call(t)) } function k(n, t) { if (!(this instanceof k)) return function (t) { return new k(t, n).container() }; !0 === (t = void 0 === t ? {} : t) && (t = {}), Array.isArray(t) && (t = { buttons: t }), this.c = v.extend(!0, {}, k.defaults, t), t.buttons && (this.c.buttons = t.buttons), this.s = { dt: new e.Api(n), buttons: [], listenKeys: "", namespace: "dtb" + o++ }, this.dom = { container: v("<" + this.c.dom.container.tag + "/>").addClass(this.c.dom.container.className) }, this._constructor() } v.extend(k.prototype, { action: function (t, n) { t = this._nodeToButton(t); return n === x ? t.conf.action : (t.conf.action = n, this) }, active: function (t, n) { var t = this._nodeToButton(t), e = this.c.dom.button.active, t = v(t.node); return n === x ? t.hasClass(e) : (t.toggleClass(e, n === x || n), this) }, add: function (t, n, e) { var o = this.s.buttons; if ("string" == typeof n) { for (var i = n.split("-"), s = this.s, r = 0, a = i.length - 1; r < a; r++)s = s.buttons[+i[r]]; o = s.buttons, n = +i[i.length - 1] } return this._expandButton(o, t, t !== x ? t.split : x, (t === x || t.split === x || 0 === t.split.length) && s !== x, !1, n), e !== x && !0 !== e || this._draw(), this }, collectionRebuild: function (t, n) { var e = this._nodeToButton(t); if (n !== x) { for (var o = e.buttons.length - 1; 0 <= o; o--)this.remove(e.buttons[o].node); for (e.conf.prefixButtons && n.unshift.apply(n, e.conf.prefixButtons), e.conf.postfixButtons && n.push.apply(n, e.conf.postfixButtons), o = 0; o < n.length; o++) { var i = n[o]; this._expandButton(e.buttons, i, i !== x && i.config !== x && i.config.split !== x, !0, i.parentConf !== x && i.parentConf.split !== x, null, i.parentConf) } } this._draw(e.collection, e.buttons) }, container: function () { return this.dom.container }, disable: function (t) { t = this._nodeToButton(t); return v(t.node).addClass(this.c.dom.button.disabled).prop("disabled", !0), this }, destroy: function () { v("body").off("keyup." + this.s.namespace); for (var t = this.s.buttons.slice(), n = 0, e = t.length; n < e; n++)this.remove(t[n].node); this.dom.container.remove(); var o = this.s.dt.settings()[0]; for (n = 0, e = o.length; n < e; n++)if (o.inst === this) { o.splice(n, 1); break } return this }, enable: function (t, n) { return !1 === n ? this.disable(t) : (n = this._nodeToButton(t), v(n.node).removeClass(this.c.dom.button.disabled).prop("disabled", !1), this) }, index: function (t, n, e) { n || (n = "", e = this.s.buttons); for (var o = 0, i = e.length; o < i; o++) { var s = e[o].buttons; if (e[o].node === t) return n + o; if (s && s.length) { s = this.index(t, o + "-", s); if (null !== s) return s } } return null }, name: function () { return this.c.name }, node: function (t) { return t ? (t = this._nodeToButton(t), v(t.node)) : this.dom.container }, processing: function (t, n) { var e = this.s.dt, o = this._nodeToButton(t); return n === x ? v(o.node).hasClass("processing") : (v(o.node).toggleClass("processing", n), v(e.table().node()).triggerHandler("buttons-processing.dt", [n, e.button(t), e, v(t), o.conf]), this) }, remove: function (t) { var n = this._nodeToButton(t), e = this._nodeToHost(t), o = this.s.dt; if (n.buttons.length) for (var i = n.buttons.length - 1; 0 <= i; i--)this.remove(n.buttons[i].node); n.conf.destroying = !0, n.conf.destroy && n.conf.destroy.call(o.button(t), o, v(t), n.conf), this._removeKey(n.conf), v(n.node).remove(); o = v.inArray(n, e); return e.splice(o, 1), this }, text: function (t, n) { function e(t) { return "function" == typeof t ? t(i, s, o.conf) : t } var o = this._nodeToButton(t), t = this.c.dom.collection.buttonLiner, t = (o.inCollection && t && t.tag ? t : this.c.dom.buttonLiner).tag, i = this.s.dt, s = v(o.node); return n === x ? e(o.conf.text) : (o.conf.text = n, (t ? s.children(t).eq(0).filter(":not(.dt-down-arrow)") : s).html(e(n)), this) }, _constructor: function () { var e = this, t = this.s.dt, o = t.settings()[0], n = this.c.buttons; o._buttons || (o._buttons = []), o._buttons.push({ inst: this, name: this.c.name }); for (var i = 0, s = n.length; i < s; i++)this.add(n[i]); t.on("destroy", function (t, n) { n === o && e.destroy() }), v("body").on("keyup." + this.s.namespace, function (t) { var n; y.activeElement && y.activeElement !== y.body || (n = String.fromCharCode(t.keyCode).toLowerCase(), -1 !== e.s.listenKeys.toLowerCase().indexOf(n) && e._keypress(n, t)) }) }, _addKey: function (t) { t.key && (this.s.listenKeys += (v.isPlainObject(t.key) ? t.key : t).key) }, _draw: function (t, n) { t || (t = this.dom.container, n = this.s.buttons), t.children().detach(); for (var e = 0, o = n.length; e < o; e++)t.append(n[e].inserter), t.append(" "), n[e].buttons && n[e].buttons.length && this._draw(n[e].collection, n[e].buttons) }, _expandButton: function (t, n, e, o, i, s, r) { var a = this.s.dt, l = !1, c = Array.isArray(n) ? n : [n]; n === x && (c = Array.isArray(e) ? e : [e]), n !== x && n.split !== x && (l = !0); for (var u = 0, d = c.length; u < d; u++) { var f = this._resolveExtends(c[u]); if (f) if (l = !(f.config === x || !f.config.split), Array.isArray(f)) this._expandButton(t, f, p !== x && p.conf !== x ? p.conf.split : x, o, r !== x && r.split !== x, s, r); else { var p = this._buildButton(f, o, f.split !== x || f.config !== x && f.config.split !== x, i); if (p) { if (s !== x && null !== s ? (t.splice(s, 0, p), s++) : t.push(p), p.conf.buttons || p.conf.split) { if (p.collection = v("<" + (l ? this.c.dom.splitCollection : this.c.dom.collection).tag + "/>"), p.conf._collection = p.collection, p.conf.split) for (var h = 0; h < p.conf.split.length; h++)"object" == typeof p.conf.split[h] && (p.conf.split[h].parent = r, p.conf.split[h].collectionLayout === x && (p.conf.split[h].collectionLayout = p.conf.collectionLayout), p.conf.split[h].dropup === x && (p.conf.split[h].dropup = p.conf.dropup), p.conf.split[h].fade === x && (p.conf.split[h].fade = p.conf.fade)); else v(p.node).append(v('<span class="dt-down-arrow">' + this.c.dom.splitDropdown.text + "</span>")); this._expandButton(p.buttons, p.conf.buttons, p.conf.split, !l, l, s, p.conf) } p.conf.parent = r, f.init && f.init.call(a.button(p.node), a, v(p.node), f), 0 } } } }, _buildButton: function (n, t, e, o) { function i(t) { return "function" == typeof t ? t(h, l, n) : t } var s, r, a, l, c = this.c.dom.button, u = this.c.dom.buttonLiner, d = this.c.dom.collection, f = (this.c.dom.split, this.c.dom.splitCollection), p = this.c.dom.splitDropdownButton, h = this.s.dt; if (n.spacer) return r = v("<span></span>").addClass("dt-button-spacer " + n.style + " " + c.spacerClass).html(i(n.text)), { conf: n, node: r, inserter: r, buttons: [], inCollection: t, isSplit: e, inSplit: o, collection: null }; if (!e && o && f ? c = p : !e && t && d.button && (c = d.button), !e && o && f.buttonLiner ? u = f.buttonLiner : !e && t && d.buttonLiner && (u = d.buttonLiner), n.available && !n.available(h, n) && !n.hasOwnProperty("html")) return !1; n.hasOwnProperty("html") ? l = v(n.html) : (s = function (t, n, e, o) { o.action.call(n.button(e), t, n, e, o), v(n.table().node()).triggerHandler("buttons-action.dt", [n.button(e), n, e, o]) }, r = n.tag || c.tag, a = n.clickBlurs === x || n.clickBlurs, l = v("<" + r + "/>").addClass(c.className).addClass(o ? this.c.dom.splitDropdownButton.className : "").attr("tabindex", this.s.dt.settings()[0].iTabIndex).attr("aria-controls", this.s.dt.table().node().id).on("click.dtb", function (t) { t.preventDefault(), !l.hasClass(c.disabled) && n.action && s(t, h, l, n), a && l.trigger("blur") }).on("keypress.dtb", function (t) { 13 === t.keyCode && (t.preventDefault(), !l.hasClass(c.disabled) && n.action && s(t, h, l, n)) }), "a" === r.toLowerCase() && l.attr("href", "#"), "button" === r.toLowerCase() && l.attr("type", "button"), u.tag ? (p = v("<" + u.tag + "/>").html(i(n.text)).addClass(u.className), "a" === u.tag.toLowerCase() && p.attr("href", "#"), l.append(p)) : l.html(i(n.text)), !1 === n.enabled && l.addClass(c.disabled), n.className && l.addClass(n.className), n.titleAttr && l.attr("title", i(n.titleAttr)), n.attr && l.attr(n.attr), n.namespace || (n.namespace = ".dt-button-" + C++), n.config !== x && n.config.split && (n.split = n.config.split)); var b, g, m, y, f = this.c.dom.buttonContainer, d = f && f.tag ? v("<" + f.tag + "/>").addClass(f.className).append(l) : l; return this._addKey(n), this.c.buttonCreated && (d = this.c.buttonCreated(n, d)), e && ((b = v("<div/>").addClass(this.c.dom.splitWrapper.className)).append(l), g = v.extend(n, { text: this.c.dom.splitDropdown.text, className: this.c.dom.splitDropdown.className, closeButton: !1, attr: { "aria-haspopup": "dialog", "aria-expanded": !1 }, align: this.c.dom.splitDropdown.align, splitAlignClass: this.c.dom.splitDropdown.splitAlignClass }), this._addKey(g), m = function (t, n, e, o) { w.split.action.call(n.button(b), t, n, e, o), v(n.table().node()).triggerHandler("buttons-action.dt", [n.button(e), n, e, o]), e.attr("aria-expanded", !0) }, y = v('<button class="' + this.c.dom.splitDropdown.className + ' dt-button"><span class="dt-btn-split-drop-arrow">' + this.c.dom.splitDropdown.text + "</span></button>").on("click.dtb", function (t) { t.preventDefault(), t.stopPropagation(), y.hasClass(c.disabled) || m(t, h, y, g), a && y.trigger("blur") }).on("keypress.dtb", function (t) { 13 === t.keyCode && (t.preventDefault(), y.hasClass(c.disabled) || m(t, h, y, g)) }), 0 === n.split.length && y.addClass("dtb-hide-drop"), b.append(y).attr(g.attr)), { conf: n, node: (e ? b : l).get(0), inserter: e ? b : d, buttons: [], inCollection: t, isSplit: e, inSplit: o, collection: null } }, _nodeToButton: function (t, n) { for (var e = 0, o = (n = n || this.s.buttons).length; e < o; e++) { if (n[e].node === t) return n[e]; if (n[e].buttons.length) { var i = this._nodeToButton(t, n[e].buttons); if (i) return i } } }, _nodeToHost: function (t, n) { for (var e = 0, o = (n = n || this.s.buttons).length; e < o; e++) { if (n[e].node === t) return n; if (n[e].buttons.length) { var i = this._nodeToHost(t, n[e].buttons); if (i) return i } } }, _keypress: function (s, r) { var a; r._buttonsHandled || (a = function (t) { for (var n, e, o = 0, i = t.length; o < i; o++)n = t[o].conf, e = t[o].node, !n.key || n.key !== s && (!v.isPlainObject(n.key) || n.key.key !== s || n.key.shiftKey && !r.shiftKey || n.key.altKey && !r.altKey || n.key.ctrlKey && !r.ctrlKey || n.key.metaKey && !r.metaKey) || (r._buttonsHandled = !0, v(e).click()), t[o].buttons.length && a(t[o].buttons) })(this.s.buttons) }, _removeKey: function (t) { var n; t.key && (t = (v.isPlainObject(t.key) ? t.key : t).key, n = this.s.listenKeys.split(""), t = v.inArray(t, n), n.splice(t, 1), this.s.listenKeys = n.join("")) }, _resolveExtends: function (e) { function t(t) { for (var n = 0; !v.isPlainObject(t) && !Array.isArray(t);) { if (t === x) return; if ("function" == typeof t) { if (!(t = t.call(i, s, e))) return !1 } else if ("string" == typeof t) { if (!w[t]) return { html: t }; t = w[t] } if (30 < ++n) throw "Buttons: Too many iterations" } return Array.isArray(t) ? t : v.extend({}, t) } var n, o, i = this, s = this.s.dt; for (e = t(e); e && e.extend;) { if (!w[e.extend]) throw "Cannot extend unknown button type: " + e.extend; var r = t(w[e.extend]); if (Array.isArray(r)) return r; if (!r) return !1; var a = r.className; e.config !== x && r.config !== x && (e.config = v.extend({}, r.config, e.config)), e = v.extend({}, r, e), a && e.className !== a && (e.className = a + " " + e.className), e.extend = r.extend } var l = e.postfixButtons; if (l) for (e.buttons || (e.buttons = []), n = 0, o = l.length; n < o; n++)e.buttons.push(l[n]); var c = e.prefixButtons; if (c) for (e.buttons || (e.buttons = []), n = 0, o = c.length; n < o; n++)e.buttons.splice(n, 0, c[n]); return e }, _popover: function (o, t, n, e) { function i() { h = !0, A(v(".dt-button-collection"), b.fade, function () { v(this).detach() }), v(f.buttons('[aria-haspopup="dialog"][aria-expanded="true"]').nodes()).attr("aria-expanded", "false"), v("div.dt-button-background").off("click.dtb-collection"), k.background(!1, b.backgroundClassName, b.fade, g), v(m).off("resize.resize.dtb-collection"), v("body").off(".dtb-collection"), f.off("buttons-action.b-internal"), f.off("destroy") } var s, r, a, l, c, u, d, f = t, p = this.c, h = !1, b = v.extend({ align: "button-left", autoClose: !1, background: !0, backgroundClassName: "dt-button-background", closeButton: !0, contentClassName: p.dom.collection.className, collectionLayout: "", collectionTitle: "", dropup: !1, fade: 400, popoverTitle: "", rightAlignClassName: "dt-button-right", tag: p.dom.collection.tag }, n), g = t.node(); !1 === o ? i() : ((p = v(f.buttons('[aria-haspopup="dialog"][aria-expanded="true"]').nodes())).length && (g.closest("div.dt-button-collection").length && (g = p.eq(0)), i()), n = v(".dt-button", o).length, p = "", 3 === n ? p = "dtb-b3" : 2 === n ? p = "dtb-b2" : 1 === n && (p = "dtb-b1"), s = v("<div/>").addClass("dt-button-collection").addClass(b.collectionLayout).addClass(b.splitAlignClass).addClass(p).css("display", "none").attr({ "aria-modal": !0, role: "dialog" }), o = v(o).addClass(b.contentClassName).attr("role", "menu").appendTo(s), g.attr("aria-expanded", "true"), g.parents("body")[0] !== y.body && (g = y.body.lastChild), b.popoverTitle ? s.prepend('<div class="dt-button-collection-title">' + b.popoverTitle + "</div>") : b.collectionTitle && s.prepend('<div class="dt-button-collection-title">' + b.collectionTitle + "</div>"), b.closeButton && s.prepend('<div class="dtb-popover-close">x</div>').addClass("dtb-collection-closeable"), _(s.insertAfter(g), b.fade), n = v(t.table().container()), d = s.css("position"), "container" !== b.span && "dt-container" !== b.align || (g = g.parent(), s.css("width", n.width())), "absolute" === d ? (p = v(g[0].offsetParent), t = g.position(), n = g.offset(), r = p.offset(), a = p.position(), l = m.getComputedStyle(p[0]), r.height = p.outerHeight(), r.width = p.width() + parseFloat(l.paddingLeft), r.right = r.left + r.width, r.bottom = r.top + r.height, p = t.top + g.outerHeight(), c = t.left, s.css({ top: p, left: c }), l = m.getComputedStyle(s[0]), (u = s.offset()).height = s.outerHeight(), u.width = s.outerWidth(), u.right = u.left + u.width, u.bottom = u.top + u.height, u.marginTop = parseFloat(l.marginTop), u.marginBottom = parseFloat(l.marginBottom), b.dropup && (p = t.top - u.height - u.marginTop - u.marginBottom), "button-right" !== b.align && !s.hasClass(b.rightAlignClassName) || (c = t.left - u.width + g.outerWidth()), "dt-container" !== b.align && "container" !== b.align || (c = c < t.left ? -t.left : c) + u.width > r.width && (c = r.width - u.width), a.left + c + u.width > v(m).width() && (c = v(m).width() - u.width - a.left), n.left + c < 0 && (c = -n.left), a.top + p + u.height > v(m).height() + v(m).scrollTop() && (p = t.top - u.height - u.marginTop - u.marginBottom), a.top + p < v(m).scrollTop() && (p = t.top + g.outerHeight()), s.css({ top: p, left: c })) : ((d = function () { var t = v(m).height() / 2, n = s.height() / 2; s.css("marginTop", -1 * (n = t < n ? t : n)) })(), v(m).on("resize.dtb-collection", function () { d() })), b.background && k.background(!0, b.backgroundClassName, b.fade, b.backgroundHost || g), v("div.dt-button-background").on("click.dtb-collection", function () { }), b.autoClose && setTimeout(function () { f.on("buttons-action.b-internal", function (t, n, e, o) { o[0] !== g[0] && i() }) }, 0), v(s).trigger("buttons-popover.dt"), f.on("destroy", i), setTimeout(function () { h = !1, v("body").on("click.dtb-collection", function (t) { var n, e; h || (n = v.fn.addBack ? "addBack" : "andSelf", e = v(t.target).parent()[0], (v(t.target).parents()[n]().filter(o).length || v(e).hasClass("dt-buttons")) && !v(t.target).hasClass("dt-button-background") || i()) }).on("keyup.dtb-collection", function (t) { 27 === t.keyCode && i() }).on("keydown.dtb-collection", function (t) { var n = v("a, button", o), e = y.activeElement; 9 === t.keyCode && (-1 === n.index(e) ? (n.first().focus(), t.preventDefault()) : t.shiftKey ? e === n[0] && (n.last().focus(), t.preventDefault()) : e === n.last()[0] && (n.first().focus(), t.preventDefault())) }) }, 0)) } }), k.background = function (t, n, e, o) { e === x && (e = 400), o = o || y.body, t ? _(v("<div/>").addClass(n).css("display", "none").insertAfter(o), e) : A(v("div." + n), e, function () { v(this).removeClass(n).remove() }) }, k.instanceSelector = function (t, i) { var s, r, a; return t === x || null === t ? v.map(i, function (t) { return t.inst }) : (s = [], r = v.map(i, function (t) { return t.name }), (a = function (t) { var n; if (Array.isArray(t)) for (var e = 0, o = t.length; e < o; e++)a(t[e]); else "string" == typeof t ? -1 !== t.indexOf(",") ? a(t.split(",")) : -1 !== (n = v.inArray(t.trim(), r)) && s.push(i[n].inst) : "number" == typeof t ? s.push(i[t].inst) : "object" == typeof t && s.push(t) })(t), s) }, k.buttonSelector = function (t, n) { for (var c = [], u = function (t, n, e) { for (var o, i, s = 0, r = n.length; s < r; s++)(o = n[s]) && (t.push({ node: o.node, name: o.conf.name, idx: i = e !== x ? e + s : s + "" }), o.buttons && u(t, o.buttons, i + "-")) }, d = function (t, n) { var e = [], o = (u(e, n.s.buttons), v.map(e, function (t) { return t.node })); if (Array.isArray(t) || t instanceof v) for (s = 0, r = t.length; s < r; s++)d(t[s], n); else if (null === t || t === x || "*" === t) for (s = 0, r = e.length; s < r; s++)c.push({ inst: n, node: e[s].node }); else if ("number" == typeof t) n.s.buttons[t] && c.push({ inst: n, node: n.s.buttons[t].node }); else if ("string" == typeof t) if (-1 !== t.indexOf(",")) for (var i = t.split(","), s = 0, r = i.length; s < r; s++)d(i[s].trim(), n); else if (t.match(/^\d+(\-\d+)*$/)) { var a = v.map(e, function (t) { return t.idx }); c.push({ inst: n, node: e[v.inArray(t, a)].node }) } else if (-1 !== t.indexOf(":name")) { var l = t.replace(":name", ""); for (s = 0, r = e.length; s < r; s++)e[s].name === l && c.push({ inst: n, node: e[s].node }) } else v(o).filter(t).each(function () { c.push({ inst: n, node: this }) }); else "object" != typeof t || !t.nodeName || -1 !== (a = v.inArray(t, o)) && c.push({ inst: n, node: o[a] }) }, e = 0, o = t.length; e < o; e++) { var i = t[e]; d(n, i) } return c }, k.stripData = function (t, n) { return "string" == typeof t && (t = (t = t.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")).replace(/<!\-\-.*?\-\->/g, ""), n && !n.stripHtml || (t = t.replace(/<[^>]*>/g, "")), n && !n.trim || (t = t.replace(/^\s+|\s+$/g, "")), n && !n.stripNewlines || (t = t.replace(/\n/g, " ")), n && !n.decodeEntities || (l.innerHTML = t, t = l.value)), t }, k.defaults = { buttons: ["copy", "excel", "csv", "pdf", "print"], name: "main", tabIndex: 0, dom: { container: { tag: "div", className: "dt-buttons" }, collection: { tag: "div", className: "" }, button: { tag: "button", className: "dt-button", active: "active", disabled: "disabled", spacerClass: "" }, buttonLiner: { tag: "span", className: "" }, split: { tag: "div", className: "dt-button-split" }, splitWrapper: { tag: "div", className: "dt-btn-split-wrapper" }, splitDropdown: { tag: "button", text: "&#x25BC;", className: "dt-btn-split-drop", align: "split-right", splitAlignClass: "dt-button-split-left" }, splitDropdownButton: { tag: "button", className: "dt-btn-split-drop-button dt-button" }, splitCollection: { tag: "div", className: "dt-button-split-collection" } } }, v.extend(w, { collection: { text: function (t) { return t.i18n("buttons.collection", "Collection") }, className: "buttons-collection", closeButton: !(k.version = "2.3.4"), init: function (t, n, e) { n.attr("aria-expanded", !1) }, action: function (t, n, e, o) { o._collection.parents("body").length ? this.popover(!1, o) : this.popover(o._collection, o), "keypress" === t.type && v("a, button", o._collection).eq(0).focus() }, attr: { "aria-haspopup": "dialog" } }, split: { text: function (t) { return t.i18n("buttons.split", "Split") }, className: "buttons-split", closeButton: !1, init: function (t, n, e) { return n.attr("aria-expanded", !1) }, action: function (t, n, e, o) { this.popover(o._collection, o) }, attr: { "aria-haspopup": "dialog" } }, copy: function (t, n) { if (w.copyHtml5) return "copyHtml5" }, csv: function (t, n) { if (w.csvHtml5 && w.csvHtml5.available(t, n)) return "csvHtml5" }, excel: function (t, n) { if (w.excelHtml5 && w.excelHtml5.available(t, n)) return "excelHtml5" }, pdf: function (t, n) { if (w.pdfHtml5 && w.pdfHtml5.available(t, n)) return "pdfHtml5" }, pageLength: function (t) { var n = t.settings()[0].aLengthMenu, e = [], o = []; if (Array.isArray(n[0])) e = n[0], o = n[1]; else for (var i = 0; i < n.length; i++) { var s = n[i]; v.isPlainObject(s) ? (e.push(s.value), o.push(s.label)) : (e.push(s), o.push(s)) } return { extend: "collection", text: function (t) { return t.i18n("buttons.pageLength", { "-1": "Show all rows", _: "Show %d rows" }, t.page.len()) }, className: "buttons-page-length", autoClose: !0, buttons: v.map(e, function (s, t) { return { text: o[t], className: "button-page-length", action: function (t, n) { n.page.len(s).draw() }, init: function (t, n, e) { function o() { i.active(t.page.len() === s) } var i = this; t.on("length.dt" + e.namespace, o), o() }, destroy: function (t, n, e) { t.off("length.dt" + e.namespace) } } }), init: function (t, n, e) { var o = this; t.on("length.dt" + e.namespace, function () { o.text(e.text) }) }, destroy: function (t, n, e) { t.off("length.dt" + e.namespace) } } }, spacer: { style: "empty", spacer: !0, text: function (t) { return t.i18n("buttons.spacer", "") } } }), e.Api.register("buttons()", function (n, e) { e === x && (e = n, n = x), this.selector.buttonGroup = n; var t = this.iterator(!0, "table", function (t) { if (t._buttons) return k.buttonSelector(k.instanceSelector(n, t._buttons), e) }, !0); return t._groupSelector = n, t }), e.Api.register("button()", function (t, n) { t = this.buttons(t, n); return 1 < t.length && t.splice(1, t.length), t }), e.Api.registerPlural("buttons().active()", "button().active()", function (n) { return n === x ? this.map(function (t) { return t.inst.active(t.node) }) : this.each(function (t) { t.inst.active(t.node, n) }) }), e.Api.registerPlural("buttons().action()", "button().action()", function (n) { return n === x ? this.map(function (t) { return t.inst.action(t.node) }) : this.each(function (t) { t.inst.action(t.node, n) }) }), e.Api.registerPlural("buttons().collectionRebuild()", "button().collectionRebuild()", function (e) { return this.each(function (t) { for (var n = 0; n < e.length; n++)"object" == typeof e[n] && (e[n].parentConf = t); t.inst.collectionRebuild(t.node, e) }) }), e.Api.register(["buttons().enable()", "button().enable()"], function (n) { return this.each(function (t) { t.inst.enable(t.node, n) }) }), e.Api.register(["buttons().disable()", "button().disable()"], function () { return this.each(function (t) { t.inst.disable(t.node) }) }), e.Api.register("button().index()", function () { var n = null; return this.each(function (t) { t = t.inst.index(t.node); null !== t && (n = t) }), n }), e.Api.registerPlural("buttons().nodes()", "button().node()", function () { var n = v(); return v(this.each(function (t) { n = n.add(t.inst.node(t.node)) })), n }), e.Api.registerPlural("buttons().processing()", "button().processing()", function (n) { return n === x ? this.map(function (t) { return t.inst.processing(t.node) }) : this.each(function (t) { t.inst.processing(t.node, n) }) }), e.Api.registerPlural("buttons().text()", "button().text()", function (n) { return n === x ? this.map(function (t) { return t.inst.text(t.node) }) : this.each(function (t) { t.inst.text(t.node, n) }) }), e.Api.registerPlural("buttons().trigger()", "button().trigger()", function () { return this.each(function (t) { t.inst.node(t.node).trigger("click") }) }), e.Api.register("button().popover()", function (n, e) { return this.map(function (t) { return t.inst._popover(n, this.button(this[0].node), e) }) }), e.Api.register("buttons().containers()", function () { var i = v(), s = this._groupSelector; return this.iterator(!0, "table", function (t) { if (t._buttons) for (var n = k.instanceSelector(s, t._buttons), e = 0, o = n.length; e < o; e++)i = i.add(n[e].container()) }), i }), e.Api.register("buttons().container()", function () { return this.containers().eq(0) }), e.Api.register("button().add()", function (t, n, e) { var o = this.context; return o.length && (o = k.instanceSelector(this._groupSelector, o[0]._buttons)).length && o[0].add(n, t, e), this.button(this._groupSelector, t) }), e.Api.register("buttons().destroy()", function () { return this.pluck("inst").unique().each(function (t) { t.destroy() }), this }), e.Api.registerPlural("buttons().remove()", "buttons().remove()", function () { return this.each(function (t) { t.inst.remove(t.node) }), this }), e.Api.register("buttons.info()", function (t, n, e) { var o = this; return !1 === t ? (this.off("destroy.btn-info"), A(v("#datatables_buttons_info"), 400, function () { v(this).remove() }), clearTimeout(i), i = null) : (i && clearTimeout(i), v("#datatables_buttons_info").length && v("#datatables_buttons_info").remove(), t = t ? "<h2>" + t + "</h2>" : "", _(v('<div id="datatables_buttons_info" class="dt-button-info"/>').html(t).append(v("<div/>")["string" == typeof n ? "html" : "append"](n)).css("display", "none").appendTo("body")), e !== x && 0 !== e && (i = setTimeout(function () { o.buttons.info(!1) }, e)), this.on("destroy.btn-info", function () { o.buttons.info(!1) })), this }), e.Api.register("buttons.exportData()", function (t) { if (this.context.length) return c(new e.Api(this.context[0]), t) }), e.Api.register("buttons.exportInfo()", function (t) { return { filename: n(t = t || {}), title: r(t), messageTop: a(this, t.message || t.messageTop, "top"), messageBottom: a(this, t.messageBottom, "bottom") } }); var i, n = function (t) { var n; return (n = "function" == typeof (n = "*" === t.filename && "*" !== t.title && t.title !== x && null !== t.title && "" !== t.title ? t.title : t.filename) ? n() : n) === x || null === n ? null : (n = (n = -1 !== n.indexOf("*") ? n.replace("*", v("head > title").text()).trim() : n).replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, "")) + (s(t.extension) || "") }, s = function (t) { return null === t || t === x ? null : "function" == typeof t ? t() : t }, r = function (t) { t = s(t.title); return null === t ? null : -1 !== t.indexOf("*") ? t.replace("*", v("head > title").text() || "Exported data") : t }, a = function (t, n, e) { n = s(n); return null === n ? null : (t = v("caption", t.table().container()).eq(0), "*" === n ? t.css("caption-side") !== e ? null : t.length ? t.text() : "" : n) }, l = v("<textarea/>")[0], c = function (e, t) { for (var o = v.extend(!0, {}, { rows: null, columns: "", modifier: { search: "applied", order: "applied" }, orthogonal: "display", stripHtml: !0, stripNewlines: !0, decodeEntities: !0, trim: !0, format: { header: function (t) { return k.stripData(t, o) }, footer: function (t) { return k.stripData(t, o) }, body: function (t) { return k.stripData(t, o) } }, customizeData: null }, t), t = e.columns(o.columns).indexes().map(function (t) { var n = e.column(t).header(); return o.format.header(n.innerHTML, t, n) }).toArray(), n = e.table().footer() ? e.columns(o.columns).indexes().map(function (t) { var n = e.column(t).footer(); return o.format.footer(n ? n.innerHTML : "", t, n) }).toArray() : null, i = v.extend({}, o.modifier), i = (e.select && "function" == typeof e.select.info && i.selected === x && e.rows(o.rows, v.extend({ selected: !0 }, i)).any() && v.extend(i, { selected: !0 }), e.rows(o.rows, i).indexes().toArray()), i = e.cells(i, o.columns), s = i.render(o.orthogonal).toArray(), r = i.nodes().toArray(), a = t.length, l = [], c = 0, u = 0, d = 0 < a ? s.length / a : 0; u < d; u++) { for (var f = [a], p = 0; p < a; p++)f[p] = o.format.body(s[c], u, p, r[c]), c++; l[u] = f } i = { header: t, footer: n, body: l }; return o.customizeData && o.customizeData(i), i }; function t(t, n) { t = new e.Api(t), n = n || t.init().buttons || e.defaults.buttons; return new k(t, n).container() } return v.fn.dataTable.Buttons = k, v.fn.DataTable.Buttons = k, v(y).on("init.dt plugin-init.dt", function (t, n) { "dt" === t.namespace && (t = n.oInit.buttons || e.defaults.buttons) && !n._buttons && new k(n, t).container() }), e.ext.feature.push({ fnInit: t, cFeature: "B" }), e.ext.features && e.ext.features.register("buttons", t), e });
/*! Bootstrap integration for DataTables' Buttons
 * ©2016 SpryMedia Ltd - datatables.net/license
 */
!function (e) { "function" == typeof define && define.amd ? define(["jquery", "datatables.net-bs5", "datatables.net-buttons"], function (t) { return e(t, window, document) }) : "object" == typeof exports ? module.exports = function (t, n) { return t = t || window, (n = n || ("undefined" != typeof window ? require("jquery") : require("jquery")(t))).fn.dataTable || require("datatables.net-bs5")(t, n), n.fn.dataTable.Buttons || require("datatables.net-buttons")(t, n), e(n, 0, t.document) } : e(jQuery, window, document) }(function (e, t, n, o) { "use strict"; var a = e.fn.dataTable; return e.extend(!0, a.Buttons.defaults, { dom: { container: { className: "dt-buttons btn-group flex-wrap" }, button: { className: "btn btn-secondary" }, collection: { tag: "div", className: "dropdown-menu", closeButton: !1, button: { tag: "a", className: "dt-button dropdown-item", active: "active", disabled: "disabled" } }, splitWrapper: { tag: "div", className: "dt-btn-split-wrapper btn-group", closeButton: !1 }, splitDropdown: { tag: "button", text: "", className: "btn btn-secondary dt-btn-split-drop dropdown-toggle dropdown-toggle-split", closeButton: !1, align: "split-left", splitAlignClass: "dt-button-split-left" }, splitDropdownButton: { tag: "button", className: "dt-btn-split-drop-button btn btn-secondary", closeButton: !1 } }, buttonCreated: function (t, n) { return t.buttons ? e('<div class="btn-group"/>').append(n) : n } }), a.ext.buttons.collection.className += " dropdown-toggle", a.ext.buttons.collection.rightAlignClassName = "dropdown-menu-right", a });
/*!
 * Column visibility buttons for Buttons and DataTables.
 * 2016 SpryMedia Ltd - datatables.net/license
 */

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery', 'datatables.net', 'datatables.net-buttons'], function ($) {
			return factory($, window, document);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		module.exports = function (root, $) {
			if (!root) {
				// CommonJS environments without a window global must pass a
				// root. This will give an error otherwise
				root = window;
			}

			if (!$) {
				$ = typeof window !== 'undefined' ? // jQuery's factory checks for a global window
					require('jquery') :
					require('jquery')(root);
			}

			if (!$.fn.dataTable) {
				require('datatables.net')(root, $);
			}

			if (!$.fn.dataTable.Buttons) {
				require('datatables.net-buttons')(root, $);
			}

			return factory($, root, root.document);
		};
	}
	else {
		// Browser
		factory(jQuery, window, document);
	}
}(function ($, window, document, undefined) {
	'use strict';
	var DataTable = $.fn.dataTable;



	$.extend(DataTable.ext.buttons, {
		// A collection of column visibility buttons
		colvis: function (dt, conf) {
			var node = null;
			var buttonConf = {
				extend: 'collection',
				init: function (dt, n) {
					node = n;
				},
				text: function (dt) {
					return dt.i18n('buttons.colvis', 'Column visibility');
				},
				className: 'buttons-colvis',
				closeButton: false,
				buttons: [{
					extend: 'columnsToggle',
					columns: conf.columns,
					columnText: conf.columnText
				}]
			};

			// Rebuild the collection with the new column structure if columns are reordered
			dt.on('column-reorder.dt' + conf.namespace, function (e, settings, details) {
				dt.button(null, dt.button(null, node).node()).collectionRebuild([{
					extend: 'columnsToggle',
					columns: conf.columns,
					columnText: conf.columnText
				}]);
			});

			return buttonConf;
		},

		// Selected columns with individual buttons - toggle column visibility
		columnsToggle: function (dt, conf) {
			var columns = dt.columns(conf.columns).indexes().map(function (idx) {
				return {
					extend: 'columnToggle',
					columns: idx,
					columnText: conf.columnText
				};
			}).toArray();

			return columns;
		},

		// Single button to toggle column visibility
		columnToggle: function (dt, conf) {
			return {
				extend: 'columnVisibility',
				columns: conf.columns,
				columnText: conf.columnText
			};
		},

		// Selected columns with individual buttons - set column visibility
		columnsVisibility: function (dt, conf) {
			var columns = dt.columns(conf.columns).indexes().map(function (idx) {
				return {
					extend: 'columnVisibility',
					columns: idx,
					visibility: conf.visibility,
					columnText: conf.columnText
				};
			}).toArray();

			return columns;
		},

		// Single button to set column visibility
		columnVisibility: {
			columns: undefined, // column selector
			text: function (dt, button, conf) {
				return conf._columnText(dt, conf);
			},
			className: 'buttons-columnVisibility',
			action: function (e, dt, button, conf) {
				var col = dt.columns(conf.columns);
				var curr = col.visible();

				col.visible(conf.visibility !== undefined ?
					conf.visibility :
					!(curr.length ? curr[0] : false)
				);
			},
			init: function (dt, button, conf) {
				var that = this;
				button.attr('data-cv-idx', conf.columns);

				dt
					.on('column-visibility.dt' + conf.namespace, function (e, settings) {
						if (!settings.bDestroying && settings.nTable == dt.settings()[0].nTable) {
							that.active(dt.column(conf.columns).visible());
						}
					})
					.on('column-reorder.dt' + conf.namespace, function (e, settings, details) {
						// Button has been removed from the DOM
						if (conf.destroying) {
							return;
						}

						if (dt.columns(conf.columns).count() !== 1) {
							return;
						}

						// This button controls the same column index but the text for the column has
						// changed
						that.text(conf._columnText(dt, conf));

						// Since its a different column, we need to check its visibility
						that.active(dt.column(conf.columns).visible());
					});

				this.active(dt.column(conf.columns).visible());
			},
			destroy: function (dt, button, conf) {
				dt
					.off('column-visibility.dt' + conf.namespace)
					.off('column-reorder.dt' + conf.namespace);
			},

			_columnText: function (dt, conf) {
				// Use DataTables' internal data structure until this is presented
				// is a public API. The other option is to use
				// `$( column(col).node() ).text()` but the node might not have been
				// populated when Buttons is constructed.
				var idx = dt.column(conf.columns).index();
				var title = dt.settings()[0].aoColumns[idx].sTitle;

				if (!title) {
					title = dt.column(idx).header().innerHTML;
				}

				title = title
					.replace(/\n/g, " ")        // remove new lines
					.replace(/<br\s*\/?>/gi, " ")  // replace line breaks with spaces
					.replace(/<select(.*?)<\/select>/g, "") // remove select tags, including options text
					.replace(/<!\-\-.*?\-\->/g, "") // strip HTML comments
					.replace(/<.*?>/g, "")   // strip HTML
					.replace(/^\s+|\s+$/g, ""); // trim

				return conf.columnText ?
					conf.columnText(dt, idx, title) :
					title;
			}
		},


		colvisRestore: {
			className: 'buttons-colvisRestore',

			text: function (dt) {
				return dt.i18n('buttons.colvisRestore', 'Restore visibility');
			},

			init: function (dt, button, conf) {
				conf._visOriginal = dt.columns().indexes().map(function (idx) {
					return dt.column(idx).visible();
				}).toArray();
			},

			action: function (e, dt, button, conf) {
				dt.columns().every(function (i) {
					// Take into account that ColReorder might have disrupted our
					// indexes
					var idx = dt.colReorder && dt.colReorder.transpose ?
						dt.colReorder.transpose(i, 'toOriginal') :
						i;

					this.visible(conf._visOriginal[idx]);
				});
			}
		},


		colvisGroup: {
			className: 'buttons-colvisGroup',

			action: function (e, dt, button, conf) {
				dt.columns(conf.show).visible(true, false);
				dt.columns(conf.hide).visible(false, false);

				dt.columns.adjust();
			},

			show: [],

			hide: []
		}
	});


	return DataTable;
}));

/*!
 * Flash export buttons for Buttons and DataTables.
 * 2015 SpryMedia Ltd - datatables.net/license
 *
 * ZeroClipbaord - MIT license
 * Copyright (c) 2012 Joseph Huckaby
 */

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery', 'datatables.net', 'datatables.net-buttons'], function ($) {
			return factory($, window, document);
		});
	}
	else if (typeof exports === 'object') {
		// CommonJS
		module.exports = function (root, $) {
			if (!root) {
				root = window;
			}

			if (!$ || !$.fn.dataTable) {
				$ = require('datatables.net')(root, $).$;
			}

			if (!$.fn.dataTable.Buttons) {
				require('datatables.net-buttons')(root, $);
			}

			return factory($, root, root.document);
		};
	}
	else {
		// Browser
		factory(jQuery, window, document);
	}
}(function ($, window, document, undefined) {
	'use strict';
	var DataTable = $.fn.dataTable;


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * ZeroClipboard dependency
	 */

	/*
	 * ZeroClipboard 1.0.4 with modifications
	 * Author: Joseph Huckaby
	 * License: MIT
	 *
	 * Copyright (c) 2012 Joseph Huckaby
	 */
	var ZeroClipboard_TableTools = {
		version: "1.0.4-TableTools2",
		clients: {}, // registered upload clients on page, indexed by id
		moviePath: '', // URL to movie
		nextId: 1, // ID of next movie

		$: function (thingy) {
			// simple DOM lookup utility function
			if (typeof (thingy) == 'string') {
				thingy = document.getElementById(thingy);
			}
			if (!thingy.addClass) {
				// extend element with a few useful methods
				thingy.hide = function () { this.style.display = 'none'; };
				thingy.show = function () { this.style.display = ''; };
				thingy.addClass = function (name) { this.removeClass(name); this.className += ' ' + name; };
				thingy.removeClass = function (name) {
					this.className = this.className.replace(new RegExp("\\s*" + name + "\\s*"), " ").replace(/^\s+/, '').replace(/\s+$/, '');
				};
				thingy.hasClass = function (name) {
					return !!this.className.match(new RegExp("\\s*" + name + "\\s*"));
				};
			}
			return thingy;
		},

		setMoviePath: function (path) {
			// set path to ZeroClipboard.swf
			this.moviePath = path;
		},

		dispatch: function (id, eventName, args) {
			// receive event from flash movie, send to client
			var client = this.clients[id];
			if (client) {
				client.receiveEvent(eventName, args);
			}
		},

		log: function (str) {
			console.log('Flash: ' + str);
		},

		register: function (id, client) {
			// register new client to receive events
			this.clients[id] = client;
		},

		getDOMObjectPosition: function (obj) {
			// get absolute coordinates for dom element
			var info = {
				left: 0,
				top: 0,
				width: obj.width ? obj.width : obj.offsetWidth,
				height: obj.height ? obj.height : obj.offsetHeight
			};

			if (obj.style.width !== "") {
				info.width = obj.style.width.replace("px", "");
			}

			if (obj.style.height !== "") {
				info.height = obj.style.height.replace("px", "");
			}

			while (obj) {
				info.left += obj.offsetLeft;
				info.top += obj.offsetTop;
				obj = obj.offsetParent;
			}

			return info;
		},

		Client: function (elem) {
			// constructor for new simple upload client
			this.handlers = {};

			// unique ID
			this.id = ZeroClipboard_TableTools.nextId++;
			this.movieId = 'ZeroClipboard_TableToolsMovie_' + this.id;

			// register client with singleton to receive flash events
			ZeroClipboard_TableTools.register(this.id, this);

			// create movie
			if (elem) {
				this.glue(elem);
			}
		}
	};

	ZeroClipboard_TableTools.Client.prototype = {

		id: 0, // unique ID for us
		ready: false, // whether movie is ready to receive events or not
		movie: null, // reference to movie object
		clipText: '', // text to copy to clipboard
		fileName: '', // default file save name
		action: 'copy', // action to perform
		handCursorEnabled: true, // whether to show hand cursor, or default pointer cursor
		cssEffects: true, // enable CSS mouse effects on dom container
		handlers: null, // user event handlers
		sized: false,
		sheetName: '', // default sheet name for excel export

		glue: function (elem, title) {
			// glue to DOM element
			// elem can be ID or actual DOM element object
			this.domElement = ZeroClipboard_TableTools.$(elem);

			// float just above object, or zIndex 99 if dom element isn't set
			var zIndex = 99;
			if (this.domElement.style.zIndex) {
				zIndex = parseInt(this.domElement.style.zIndex, 10) + 1;
			}

			// find X/Y position of domElement
			var box = ZeroClipboard_TableTools.getDOMObjectPosition(this.domElement);

			// create floating DIV above element
			this.div = document.createElement('div');
			var style = this.div.style;
			style.position = 'absolute';
			style.left = '0px';
			style.top = '0px';
			style.width = (box.width) + 'px';
			style.height = box.height + 'px';
			style.zIndex = zIndex;

			if (typeof title != "undefined" && title !== "") {
				this.div.title = title;
			}
			if (box.width !== 0 && box.height !== 0) {
				this.sized = true;
			}

			// style.backgroundColor = '#f00'; // debug
			if (this.domElement) {
				this.domElement.appendChild(this.div);
				this.div.innerHTML = this.getHTML(box.width, box.height).replace(/&/g, '&amp;');
			}
		},

		positionElement: function () {
			var box = ZeroClipboard_TableTools.getDOMObjectPosition(this.domElement);
			var style = this.div.style;

			style.position = 'absolute';
			//style.left = (this.domElement.offsetLeft)+'px';
			//style.top = this.domElement.offsetTop+'px';
			style.width = box.width + 'px';
			style.height = box.height + 'px';

			if (box.width !== 0 && box.height !== 0) {
				this.sized = true;
			} else {
				return;
			}

			var flash = this.div.childNodes[0];
			flash.width = box.width;
			flash.height = box.height;
		},

		getHTML: function (width, height) {
			// return HTML for movie
			var html = '';
			var flashvars = 'id=' + this.id +
				'&width=' + width +
				'&height=' + height;

			if (navigator.userAgent.match(/MSIE/)) {
				// IE gets an OBJECT tag
				var protocol = location.href.match(/^https/i) ? 'https://' : 'http://';
				html += '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="' + protocol + 'download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0" width="' + width + '" height="' + height + '" id="' + this.movieId + '" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="' + ZeroClipboard_TableTools.moviePath + '" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="' + flashvars + '"/><param name="wmode" value="transparent"/></object>';
			}
			else {
				// all other browsers get an EMBED tag
				html += '<embed id="' + this.movieId + '" src="' + ZeroClipboard_TableTools.moviePath + '" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="' + width + '" height="' + height + '" name="' + this.movieId + '" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="' + flashvars + '" wmode="transparent" />';
			}
			return html;
		},

		hide: function () {
			// temporarily hide floater offscreen
			if (this.div) {
				this.div.style.left = '-2000px';
			}
		},

		show: function () {
			// show ourselves after a call to hide()
			this.reposition();
		},

		destroy: function () {
			// destroy control and floater
			var that = this;

			if (this.domElement && this.div) {
				$(this.div).remove();

				this.domElement = null;
				this.div = null;

				$.each(ZeroClipboard_TableTools.clients, function (id, client) {
					if (client === that) {
						delete ZeroClipboard_TableTools.clients[id];
					}
				});
			}
		},

		reposition: function (elem) {
			// reposition our floating div, optionally to new container
			// warning: container CANNOT change size, only position
			if (elem) {
				this.domElement = ZeroClipboard_TableTools.$(elem);
				if (!this.domElement) {
					this.hide();
				}
			}

			if (this.domElement && this.div) {
				var box = ZeroClipboard_TableTools.getDOMObjectPosition(this.domElement);
				var style = this.div.style;
				style.left = '' + box.left + 'px';
				style.top = '' + box.top + 'px';
			}
		},

		clearText: function () {
			// clear the text to be copy / saved
			this.clipText = '';
			if (this.ready) {
				this.movie.clearText();
			}
		},

		appendText: function (newText) {
			// append text to that which is to be copied / saved
			this.clipText += newText;
			if (this.ready) { this.movie.appendText(newText); }
		},

		setText: function (newText) {
			// set text to be copied to be copied / saved
			this.clipText = newText;
			if (this.ready) { this.movie.setText(newText); }
		},

		setFileName: function (newText) {
			// set the file name
			this.fileName = newText;
			if (this.ready) {
				this.movie.setFileName(newText);
			}
		},

		setSheetData: function (data) {
			// set the xlsx sheet data
			if (this.ready) {
				this.movie.setSheetData(JSON.stringify(data));
			}
		},

		setAction: function (newText) {
			// set action (save or copy)
			this.action = newText;
			if (this.ready) {
				this.movie.setAction(newText);
			}
		},

		addEventListener: function (eventName, func) {
			// add user event listener for event
			// event types: load, queueStart, fileStart, fileComplete, queueComplete, progress, error, cancel
			eventName = eventName.toString().toLowerCase().replace(/^on/, '');
			if (!this.handlers[eventName]) {
				this.handlers[eventName] = [];
			}
			this.handlers[eventName].push(func);
		},

		setHandCursor: function (enabled) {
			// enable hand cursor (true), or default arrow cursor (false)
			this.handCursorEnabled = enabled;
			if (this.ready) {
				this.movie.setHandCursor(enabled);
			}
		},

		setCSSEffects: function (enabled) {
			// enable or disable CSS effects on DOM container
			this.cssEffects = !!enabled;
		},

		receiveEvent: function (eventName, args) {
			var self;

			// receive event from flash
			eventName = eventName.toString().toLowerCase().replace(/^on/, '');

			// special behavior for certain events
			switch (eventName) {
				case 'load':
					// movie claims it is ready, but in IE this isn't always the case...
					// bug fix: Cannot extend EMBED DOM elements in Firefox, must use traditional function
					this.movie = document.getElementById(this.movieId);
					if (!this.movie) {
						self = this;
						setTimeout(function () { self.receiveEvent('load', null); }, 1);
						return;
					}

					// firefox on pc needs a "kick" in order to set these in certain cases
					if (!this.ready && navigator.userAgent.match(/Firefox/) && navigator.userAgent.match(/Windows/)) {
						self = this;
						setTimeout(function () { self.receiveEvent('load', null); }, 100);
						this.ready = true;
						return;
					}

					this.ready = true;
					this.movie.clearText();
					this.movie.appendText(this.clipText);
					this.movie.setFileName(this.fileName);
					this.movie.setAction(this.action);
					this.movie.setHandCursor(this.handCursorEnabled);
					break;

				case 'mouseover':
					if (this.domElement && this.cssEffects) {
						//this.domElement.addClass('hover');
						if (this.recoverActive) {
							this.domElement.addClass('active');
						}
					}
					break;

				case 'mouseout':
					if (this.domElement && this.cssEffects) {
						this.recoverActive = false;
						if (this.domElement.hasClass('active')) {
							this.domElement.removeClass('active');
							this.recoverActive = true;
						}
						//this.domElement.removeClass('hover');
					}
					break;

				case 'mousedown':
					if (this.domElement && this.cssEffects) {
						this.domElement.addClass('active');
					}
					break;

				case 'mouseup':
					if (this.domElement && this.cssEffects) {
						this.domElement.removeClass('active');
						this.recoverActive = false;
					}
					break;
			} // switch eventName

			if (this.handlers[eventName]) {
				for (var idx = 0, len = this.handlers[eventName].length; idx < len; idx++) {
					var func = this.handlers[eventName][idx];

					if (typeof (func) == 'function') {
						// actual function reference
						func(this, args);
					}
					else if ((typeof (func) == 'object') && (func.length == 2)) {
						// PHP style object + method, i.e. [myObject, 'myMethod']
						func[0][func[1]](this, args);
					}
					else if (typeof (func) == 'string') {
						// name of function
						window[func](this, args);
					}
				} // foreach event handler defined
			} // user defined handler for event
		}
	};

	ZeroClipboard_TableTools.hasFlash = function () {
		try {
			var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
			if (fo) {
				return true;
			}
		}
		catch (e) {
			if (
				navigator.mimeTypes &&
				navigator.mimeTypes['application/x-shockwave-flash'] !== undefined &&
				navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin
			) {
				return true;
			}
		}

		return false;
	};

	// For the Flash binding to work, ZeroClipboard_TableTools must be on the global
	// object list
	window.ZeroClipboard_TableTools = ZeroClipboard_TableTools;



	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Local (private) functions
	 */

	/**
	 * If a Buttons instance is initlaised before it is placed into the DOM, Flash
	 * won't be able to bind to it, so we need to wait until it is available, this
	 * method abstracts that out.
	 *
	 * @param {ZeroClipboard} flash ZeroClipboard instance
	 * @param {jQuery} node  Button
	 */
	var _glue = function (flash, node) {
		var id = node.attr('id');

		if (node.parents('html').length) {
			flash.glue(node[0], '');
		}
		else {
			setTimeout(function () {
				_glue(flash, node);
			}, 500);
		}
	};

	/**
	 * Get the file name for an exported file.
	 *
	 * @param {object}  config       Button configuration
	 * @param {boolean} incExtension Include the file name extension
	 */
	var _filename = function (config, incExtension) {
		// Backwards compatibility
		var filename = config.filename === '*' && config.title !== '*' && config.title !== undefined ?
			config.title :
			config.filename;

		if (typeof filename === 'function') {
			filename = filename();
		}

		if (filename.indexOf('*') !== -1) {
			filename = $.trim(filename.replace('*', $('title').text()));
		}

		// Strip characters which the OS will object to
		filename = filename.replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, "");

		return incExtension === undefined || incExtension === true ?
			filename + config.extension :
			filename;
	};

	/**
	 * Get the sheet name for Excel exports.
	 *
	 * @param {object}  config       Button configuration
	 */
	var _sheetname = function (config) {
		var sheetName = 'Sheet1';

		if (config.sheetName) {
			sheetName = config.sheetName.replace(/[\[\]\*\/\\\?\:]/g, '');
		}

		return sheetName;
	};

	/**
	 * Get the title for an exported file.
	 *
	 * @param {object}  config  Button configuration
	 */
	var _title = function (config) {
		var title = config.title;

		if (typeof title === 'function') {
			title = title();
		}

		return title.indexOf('*') !== -1 ?
			title.replace('*', $('title').text() || 'Exported data') :
			title;
	};

	/**
	 * Set the flash text. This has to be broken up into chunks as the Javascript /
	 * Flash bridge has a size limit. There is no indication in the Flash
	 * documentation what this is, and it probably depends upon the browser.
	 * Experimentation shows that the point is around 50k when data starts to get
	 * lost, so an 8K limit used here is safe.
	 *
	 * @param {ZeroClipboard} flash ZeroClipboard instance
	 * @param {string}        data  Data to send to Flash
	 */
	var _setText = function (flash, data) {
		var parts = data.match(/[\s\S]{1,8192}/g) || [];

		flash.clearText();
		for (var i = 0, len = parts.length; i < len; i++) {
			flash.appendText(parts[i]);
		}
	};

	/**
	 * Get the newline character(s)
	 *
	 * @param {object}  config Button configuration
	 * @return {string}        Newline character
	 */
	var _newLine = function (config) {
		return config.newline ?
			config.newline :
			navigator.userAgent.match(/Windows/) ?
				'\r\n' :
				'\n';
	};

	/**
	 * Combine the data from the `buttons.exportData` method into a string that
	 * will be used in the export file.
	 *
	 * @param  {DataTable.Api} dt     DataTables API instance
	 * @param  {object}        config Button configuration
	 * @return {object}               The data to export
	 */
	var _exportData = function (dt, config) {
		var newLine = _newLine(config);
		var data = dt.buttons.exportData(config.exportOptions);
		var boundary = config.fieldBoundary;
		var separator = config.fieldSeparator;
		var reBoundary = new RegExp(boundary, 'g');
		var escapeChar = config.escapeChar !== undefined ?
			config.escapeChar :
			'\\';
		var join = function (a) {
			var s = '';

			// If there is a field boundary, then we might need to escape it in
			// the source data
			for (var i = 0, ien = a.length; i < ien; i++) {
				if (i > 0) {
					s += separator;
				}

				s += boundary ?
					boundary + ('' + a[i]).replace(reBoundary, escapeChar + boundary) + boundary :
					a[i];
			}

			return s;
		};

		var header = config.header ? join(data.header) + newLine : '';
		var footer = config.footer && data.footer ? newLine + join(data.footer) : '';
		var body = [];

		for (var i = 0, ien = data.body.length; i < ien; i++) {
			body.push(join(data.body[i]));
		}

		return {
			str: header + body.join(newLine) + footer,
			rows: body.length
		};
	};


	// Basic initialisation for the buttons is common between them
	var flashButton = {
		available: function () {
			return ZeroClipboard_TableTools.hasFlash();
		},

		init: function (dt, button, config) {
			// Insert the Flash movie
			ZeroClipboard_TableTools.moviePath = DataTable.Buttons.swfPath;
			var flash = new ZeroClipboard_TableTools.Client();

			flash.setHandCursor(true);
			flash.addEventListener('mouseDown', function (client) {
				config._fromFlash = true;
				dt.button(button[0]).trigger();
				config._fromFlash = false;
			});

			_glue(flash, button);

			config._flash = flash;
		},

		destroy: function (dt, button, config) {
			config._flash.destroy();
		},

		fieldSeparator: ',',

		fieldBoundary: '"',

		exportOptions: {},

		title: '*',

		filename: '*',

		extension: '.csv',

		header: true,

		footer: false
	};


	/**
	 * Convert from numeric position to letter for column names in Excel
	 * @param  {int} n Column number
	 * @return {string} Column letter(s) name
	 */
	function createCellPos(n) {
		var ordA = 'A'.charCodeAt(0);
		var ordZ = 'Z'.charCodeAt(0);
		var len = ordZ - ordA + 1;
		var s = "";

		while (n >= 0) {
			s = String.fromCharCode(n % len + ordA) + s;
			n = Math.floor(n / len) - 1;
		}

		return s;
	}

	/**
	 * Create an XML node and add any children, attributes, etc without needing to
	 * be verbose in the DOM.
	 *
	 * @param  {object} doc      XML document
	 * @param  {string} nodeName Node name
	 * @param  {object} opts     Options - can be `attr` (attributes), `children`
	 *   (child nodes) and `text` (text content)
	 * @return {node}            Created node
	 */
	function _createNode(doc, nodeName, opts) {
		var tempNode = doc.createElement(nodeName);

		if (opts) {
			if (opts.attr) {
				$(tempNode).attr(opts.attr);
			}

			if (opts.children) {
				$.each(opts.children, function (key, value) {
					tempNode.appendChild(value);
				});
			}

			if (opts.text) {
				tempNode.appendChild(doc.createTextNode(opts.text));
			}
		}

		return tempNode;
	}

	/**
	 * Get the width for an Excel column based on the contents of that column
	 * @param  {object} data Data for export
	 * @param  {int}    col  Column index
	 * @return {int}         Column width
	 */
	function _excelColWidth(data, col) {
		var max = data.header[col].length;
		var len, lineSplit, str;

		if (data.footer && data.footer[col].length > max) {
			max = data.footer[col].length;
		}

		for (var i = 0, ien = data.body.length; i < ien; i++) {
			var point = data.body[i][col];
			str = point !== null && point !== undefined ?
				point.toString() :
				'';

			// If there is a newline character, workout the width of the column
			// based on the longest line in the string
			if (str.indexOf('\n') !== -1) {
				lineSplit = str.split('\n');
				lineSplit.sort(function (a, b) {
					return b.length - a.length;
				});

				len = lineSplit[0].length;
			}
			else {
				len = str.length;
			}

			if (len > max) {
				max = len;
			}

			// Max width rather than having potentially massive column widths
			if (max > 40) {
				return 52; // 40 * 1.3
			}
		}

		max *= 1.3;

		// And a min width
		return max > 6 ? max : 6;
	}

	var _serialiser = "";
	if (typeof window.XMLSerializer === 'undefined') {
		_serialiser = new function () {
			this.serializeToString = function (input) {
				return input.xml
			}
		};
	} else {
		_serialiser = new XMLSerializer();
	}

	var _ieExcel;


	/**
	 * Convert XML documents in an object to strings
	 * @param  {object} obj XLSX document object
	 */
	function _xlsxToStrings(obj) {
		if (_ieExcel === undefined) {
			// Detect if we are dealing with IE's _awful_ serialiser by seeing if it
			// drop attributes
			_ieExcel = _serialiser
				.serializeToString(
					$.parseXML(excelStrings['xl/worksheets/sheet1.xml'])
				)
				.indexOf('xmlns:r') === -1;
		}

		$.each(obj, function (name, val) {
			if ($.isPlainObject(val)) {
				_xlsxToStrings(val);
			}
			else {
				if (_ieExcel) {
					// IE's XML serialiser will drop some name space attributes from
					// from the root node, so we need to save them. Do this by
					// replacing the namespace nodes with a regular attribute that
					// we convert back when serialised. Edge does not have this
					// issue
					var worksheet = val.childNodes[0];
					var i, ien;
					var attrs = [];

					for (i = worksheet.attributes.length - 1; i >= 0; i--) {
						var attrName = worksheet.attributes[i].nodeName;
						var attrValue = worksheet.attributes[i].nodeValue;

						if (attrName.indexOf(':') !== -1) {
							attrs.push({ name: attrName, value: attrValue });

							worksheet.removeAttribute(attrName);
						}
					}

					for (i = 0, ien = attrs.length; i < ien; i++) {
						var attr = val.createAttribute(attrs[i].name.replace(':', '_dt_b_namespace_token_'));
						attr.value = attrs[i].value;
						worksheet.setAttributeNode(attr);
					}
				}

				var str = _serialiser.serializeToString(val);

				// Fix IE's XML
				if (_ieExcel) {
					// IE doesn't include the XML declaration
					if (str.indexOf('<?xml') === -1) {
						str = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + str;
					}

					// Return namespace attributes to being as such
					str = str.replace(/_dt_b_namespace_token_/g, ':');
				}

				// Safari, IE and Edge will put empty name space attributes onto
				// various elements making them useless. This strips them out
				str = str.replace(/<([^<>]*?) xmlns=""([^<>]*?)>/g, '<$1 $2>');

				obj[name] = str;
			}
		});
	}

	// Excel - Pre-defined strings to build a basic XLSX file
	var excelStrings = {
		"_rels/.rels":
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
			'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
			'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
			'</Relationships>',

		"xl/_rels/workbook.xml.rels":
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
			'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
			'<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
			'<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
			'</Relationships>',

		"[Content_Types].xml":
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
			'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
			'<Default Extension="xml" ContentType="application/xml" />' +
			'<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />' +
			'<Default Extension="jpeg" ContentType="image/jpeg" />' +
			'<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />' +
			'<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />' +
			'<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" />' +
			'</Types>',

		"xl/workbook.xml":
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
			'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
			'<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/>' +
			'<workbookPr showInkAnnotation="0" autoCompressPictures="0"/>' +
			'<bookViews>' +
			'<workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/>' +
			'</bookViews>' +
			'<sheets>' +
			'<sheet name="" sheetId="1" r:id="rId1"/>' +
			'</sheets>' +
			'</workbook>',

		"xl/worksheets/sheet1.xml":
			'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
			'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' +
			'<sheetData/>' +
			'</worksheet>',

		"xl/styles.xml":
			'<?xml version="1.0" encoding="UTF-8"?>' +
			'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' +
			'<numFmts count="6">' +
			'<numFmt numFmtId="164" formatCode="#,##0.00_-\ [$$-45C]"/>' +
			'<numFmt numFmtId="165" formatCode="&quot;£&quot;#,##0.00"/>' +
			'<numFmt numFmtId="166" formatCode="[$€-2]\ #,##0.00"/>' +
			'<numFmt numFmtId="167" formatCode="0.0%"/>' +
			'<numFmt numFmtId="168" formatCode="#,##0;(#,##0)"/>' +
			'<numFmt numFmtId="169" formatCode="#,##0.00;(#,##0.00)"/>' +
			'</numFmts>' +
			'<fonts count="5" x14ac:knownFonts="1">' +
			'<font>' +
			'<sz val="11" />' +
			'<name val="Calibri" />' +
			'</font>' +
			'<font>' +
			'<sz val="11" />' +
			'<name val="Calibri" />' +
			'<color rgb="FFFFFFFF" />' +
			'</font>' +
			'<font>' +
			'<sz val="11" />' +
			'<name val="Calibri" />' +
			'<b />' +
			'</font>' +
			'<font>' +
			'<sz val="11" />' +
			'<name val="Calibri" />' +
			'<i />' +
			'</font>' +
			'<font>' +
			'<sz val="11" />' +
			'<name val="Calibri" />' +
			'<u />' +
			'</font>' +
			'</fonts>' +
			'<fills count="6">' +
			'<fill>' +
			'<patternFill patternType="none" />' +
			'</fill>' +
			'<fill/>' + // Excel appears to use this as a dotted background regardless of values
			'<fill>' +
			'<patternFill patternType="solid">' +
			'<fgColor rgb="FFD9D9D9" />' +
			'<bgColor indexed="64" />' +
			'</patternFill>' +
			'</fill>' +
			'<fill>' +
			'<patternFill patternType="solid">' +
			'<fgColor rgb="FFD99795" />' +
			'<bgColor indexed="64" />' +
			'</patternFill>' +
			'</fill>' +
			'<fill>' +
			'<patternFill patternType="solid">' +
			'<fgColor rgb="ffc6efce" />' +
			'<bgColor indexed="64" />' +
			'</patternFill>' +
			'</fill>' +
			'<fill>' +
			'<patternFill patternType="solid">' +
			'<fgColor rgb="ffc6cfef" />' +
			'<bgColor indexed="64" />' +
			'</patternFill>' +
			'</fill>' +
			'</fills>' +
			'<borders count="2">' +
			'<border>' +
			'<left />' +
			'<right />' +
			'<top />' +
			'<bottom />' +
			'<diagonal />' +
			'</border>' +
			'<border diagonalUp="false" diagonalDown="false">' +
			'<left style="thin">' +
			'<color auto="1" />' +
			'</left>' +
			'<right style="thin">' +
			'<color auto="1" />' +
			'</right>' +
			'<top style="thin">' +
			'<color auto="1" />' +
			'</top>' +
			'<bottom style="thin">' +
			'<color auto="1" />' +
			'</bottom>' +
			'<diagonal />' +
			'</border>' +
			'</borders>' +
			'<cellStyleXfs count="1">' +
			'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" />' +
			'</cellStyleXfs>' +
			'<cellXfs count="61">' +
			'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="3" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="4" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="0" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="1" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="2" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="3" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="4" fillId="3" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="0" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="1" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="2" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="3" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="4" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="4" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="1" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="4" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
			'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
			'<alignment horizontal="left"/>' +
			'</xf>' +
			'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
			'<alignment horizontal="center"/>' +
			'</xf>' +
			'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
			'<alignment horizontal="right"/>' +
			'</xf>' +
			'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
			'<alignment horizontal="fill"/>' +
			'</xf>' +
			'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
			'<alignment textRotation="90"/>' +
			'</xf>' +
			'<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
			'<alignment wrapText="1"/>' +
			'</xf>' +
			'<xf numFmtId="9"   fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
			'<xf numFmtId="164" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
			'<xf numFmtId="165" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
			'<xf numFmtId="166" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
			'<xf numFmtId="167" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
			'<xf numFmtId="168" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
			'<xf numFmtId="169" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
			'<xf numFmtId="3" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
			'<xf numFmtId="4" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyNumberFormat="1"/>' +
			'</cellXfs>' +
			'<cellStyles count="1">' +
			'<cellStyle name="Normal" xfId="0" builtinId="0" />' +
			'</cellStyles>' +
			'<dxfs count="0" />' +
			'<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4" />' +
			'</styleSheet>'
	};
	// Note we could use 3 `for` loops for the styles, but when gzipped there is
	// virtually no difference in size, since the above can be easily compressed

	// Pattern matching for special number formats. Perhaps this should be exposed
	// via an API in future?
	var _excelSpecials = [
		{ match: /^\-?\d+\.\d%$/, style: 60, fmt: function (d) { return d / 100; } }, // Precent with d.p.
		{ match: /^\-?\d+\.?\d*%$/, style: 56, fmt: function (d) { return d / 100; } }, // Percent
		{ match: /^\-?\$[\d,]+.?\d*$/, style: 57 }, // Dollars
		{ match: /^\-?£[\d,]+.?\d*$/, style: 58 }, // Pounds
		{ match: /^\-?€[\d,]+.?\d*$/, style: 59 }, // Euros
		{ match: /^\([\d,]+\)$/, style: 61, fmt: function (d) { return -1 * d.replace(/[\(\)]/g, ''); } },  // Negative numbers indicated by brackets
		{ match: /^\([\d,]+\.\d{2}\)$/, style: 62, fmt: function (d) { return -1 * d.replace(/[\(\)]/g, ''); } },  // Negative numbers indicated by brackets - 2d.p.
		{ match: /^[\d,]+$/, style: 63 }, // Numbers with thousand separators
		{ match: /^[\d,]+\.\d{2}$/, style: 64 }  // Numbers with 2d.p. and thousands separators
	];



	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * DataTables options and methods
	 */

	// Set the default SWF path
	DataTable.Buttons.swfPath = '//cdn.datatables.net/buttons/1.2.4/swf/flashExport.swf';

	// Method to allow Flash buttons to be resized when made visible - as they are
	// of zero height and width if initialised hidden
	DataTable.Api.register('buttons.resize()', function () {
		$.each(ZeroClipboard_TableTools.clients, function (i, client) {
			if (client.domElement !== undefined && client.domElement.parentNode) {
				client.positionElement();
			}
		});
	});


	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Button definitions
	 */

	// Copy to clipboard
	DataTable.ext.buttons.copyFlash = $.extend({}, flashButton, {
		className: 'buttons-copy buttons-flash',

		text: function (dt) {
			return dt.i18n('buttons.copy', 'Copy');
		},

		action: function (e, dt, button, config) {
			// Check that the trigger did actually occur due to a Flash activation
			if (!config._fromFlash) {
				return;
			}

			this.processing(true);

			var flash = config._flash;
			var data = _exportData(dt, config);
			var output = config.customize ?
				config.customize(data.str, config) :
				data.str;

			flash.setAction('copy');
			_setText(flash, output);

			this.processing(false);

			dt.buttons.info(
				dt.i18n('buttons.copyTitle', 'Copy to clipboard'),
				dt.i18n('buttons.copySuccess', {
					_: 'Copied %d rows to clipboard',
					1: 'Copied 1 row to clipboard'
				}, data.rows),
				3000
			);
		},

		fieldSeparator: '\t',

		fieldBoundary: ''
	});

	// CSV save file
	DataTable.ext.buttons.csvFlash = $.extend({}, flashButton, {
		className: 'buttons-csv buttons-flash',

		text: function (dt) {
			return dt.i18n('buttons.csv', 'CSV');
		},

		action: function (e, dt, button, config) {
			// Set the text
			var flash = config._flash;
			var data = _exportData(dt, config);
			var output = config.customize ?
				config.customize(data.str, config) :
				data.str;

			flash.setAction('csv');
			flash.setFileName(_filename(config));
			_setText(flash, output);
		},

		escapeChar: '"'
	});

	// Excel save file - this is really a CSV file using UTF-8 that Excel can read
	DataTable.ext.buttons.excelFlash = $.extend({}, flashButton, {
		className: 'buttons-excel buttons-flash',

		text: function (dt) {
			return dt.i18n('buttons.excel', 'Excel');
		},

		action: function (e, dt, button, config) {
			this.processing(true);

			var flash = config._flash;
			var rowPos = 0;
			var rels = $.parseXML(excelStrings['xl/worksheets/sheet1.xml']); //Parses xml
			var relsGet = rels.getElementsByTagName("sheetData")[0];

			var xlsx = {
				_rels: {
					".rels": $.parseXML(excelStrings['_rels/.rels'])
				},
				xl: {
					_rels: {
						"workbook.xml.rels": $.parseXML(excelStrings['xl/_rels/workbook.xml.rels'])
					},
					"workbook.xml": $.parseXML(excelStrings['xl/workbook.xml']),
					"styles.xml": $.parseXML(excelStrings['xl/styles.xml']),
					"worksheets": {
						"sheet1.xml": rels
					}

				},
				"[Content_Types].xml": $.parseXML(excelStrings['[Content_Types].xml'])
			};

			var data = dt.buttons.exportData(config.exportOptions);
			var currentRow, rowNode;
			var addRow = function (row) {
				currentRow = rowPos + 1;
				rowNode = _createNode(rels, "row", { attr: { r: currentRow } });

				for (var i = 0, ien = row.length; i < ien; i++) {
					// Concat both the Cell Columns as a letter and the Row of the cell.
					var cellId = createCellPos(i) + '' + currentRow;
					var cell = null;

					// For null, undefined of blank cell, continue so it doesn't create the _createNode
					if (row[i] === null || row[i] === undefined || row[i] === '') {
						continue;
					}

					row[i] = $.trim(row[i]);

					// Special number formatting options
					for (var j = 0, jen = _excelSpecials.length; j < jen; j++) {
						var special = _excelSpecials[j];

						// TODO Need to provide the ability for the specials to say
						// if they are returning a string, since at the moment it is
						// assumed to be a number
						if (row[i].match && !row[i].match(/^0\d+/) && row[i].match(special.match)) {
							var val = row[i].replace(/[^\d\.\-]/g, '');

							if (special.fmt) {
								val = special.fmt(val);
							}

							cell = _createNode(rels, 'c', {
								attr: {
									r: cellId,
									s: special.style
								},
								children: [
									_createNode(rels, 'v', { text: val })
								]
							});

							break;
						}
					}

					if (!cell) {
						if (typeof row[i] === 'number' || (
							row[i].match &&
							row[i].match(/^-?\d+(\.\d+)?$/) &&
							!row[i].match(/^0\d+/))
						) {
							// Detect numbers - don't match numbers with leading zeros
							// or a negative anywhere but the start
							cell = _createNode(rels, 'c', {
								attr: {
									t: 'n',
									r: cellId
								},
								children: [
									_createNode(rels, 'v', { text: row[i] })
								]
							});
						}
						else {
							// String output - replace non standard characters for text output
							var text = !row[i].replace ?
								row[i] :
								row[i].replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');

							cell = _createNode(rels, 'c', {
								attr: {
									t: 'inlineStr',
									r: cellId
								},
								children: {
									row: _createNode(rels, 'is', {
										children: {
											row: _createNode(rels, 't', {
												text: text
											})
										}
									})
								}
							});
						}
					}

					rowNode.appendChild(cell);
				}

				relsGet.appendChild(rowNode);
				rowPos++;
			};

			$('sheets sheet', xlsx.xl['workbook.xml']).attr('name', _sheetname(config));

			if (config.customizeData) {
				config.customizeData(data);
			}

			if (config.header) {
				addRow(data.header, rowPos);
				$('row c', rels).attr('s', '2'); // bold
			}

			for (var n = 0, ie = data.body.length; n < ie; n++) {
				addRow(data.body[n], rowPos);
			}

			if (config.footer && data.footer) {
				addRow(data.footer, rowPos);
				$('row:last c', rels).attr('s', '2'); // bold
			}

			// Set column widths
			var cols = _createNode(rels, 'cols');
			$('worksheet', rels).prepend(cols);

			for (var i = 0, ien = data.header.length; i < ien; i++) {
				cols.appendChild(_createNode(rels, 'col', {
					attr: {
						min: i + 1,
						max: i + 1,
						width: _excelColWidth(data, i),

