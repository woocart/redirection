/**
 * External dependencies
 */

import React, { useState } from 'react';
import { translate as __ } from 'wp-plugin-lib/locale';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */

import EditRedirect from 'component/redirect-edit';
import Modal from 'wp-plugin-components/modal';
import { getDefaultItem } from 'state/redirect/selector';
import { getFlags } from 'state/settings/selector';
import { deleteExact } from 'state/error/action';
import { has_capability, CAP_404_DELETE } from 'lib/capabilities';

function getRowForId( url, rows ) {
	const rowUrl = rows.find( ( row ) => row.id === url );

	if ( rowUrl ) {
		return rowUrl.url;
	}

	return url;
}

function getUniqueUrls( urls, rows ) {
	if ( ! urls ) {
		return '';
	}

	if ( ! Array.isArray( urls ) ) {
		return urls;
	}

	return [ ...new Set( urls.map( ( url ) => getRowForId( url, rows ) ) ) ];
}

function CreateRedirect( props ) {
	const { onClose, redirect, defaultFlags, onDelete, rows } = props;
	const uniqueUrls = getUniqueUrls( redirect.url, rows );
	const [ deleteLog, setDeleteLog ] = useState( false );
	const item = { ...getDefaultItem( uniqueUrls, 0, defaultFlags ), ...redirect, url: uniqueUrls };

	return (
		<Modal onClose={ onClose } padding>
			<div className="add-new">
				<EditRedirect
					item={ item }
					saveButton={ __( 'Add Redirect' ) }
					onCancel={ onClose }
					childSave={ () => deleteLog && onDelete( uniqueUrls ) }
					autoFocus
				>
					{ has_capability( CAP_404_DELETE ) && (
						<tr>
							<th>{ __( 'Delete Log Entries' ) }</th>
							<td className="edit-left" style={ { padding: '7px 0px' } }>
								<label>
									<input
										type="checkbox"
										checked={ deleteLog }
										onChange={ ( ev ) => setDeleteLog( ev.target.checked ) }
									/>

									{ uniqueUrls.length <= 1
										? __( 'Delete logs for this entry' )
										: __( 'Delete logs for these entries' ) }
								</label>
							</td>
						</tr>
					) }
				</EditRedirect>
			</div>
		</Modal>
	);
}

function mapDispatchToProps( dispatch ) {
	return {
		onDelete: ( selected ) => {
			dispatch( deleteExact( selected ) );
		},
	};
}

function mapStateToProps( state ) {
	const { rows } = state.error;

	return {
		defaultFlags: getFlags( state ),
		rows,
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( CreateRedirect );
