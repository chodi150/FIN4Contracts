import React, { Component } from 'react';
import { Box } from '../../Styles';
import ContractData from '../../ContractData';

class PreviousClaims extends Component {
	getClaims = data => {
		return data[3].map((id, index) => {
			return {
				id: id,
				tokenName: data[1],
				tokenSymbol: data[2],
				tokenAddress: data[0],
				isApproved: data[4][index],
				quantity: data[5][index]
			};
		});
	};

	showClaimByActionTypes = data => {
		const claims = data
			? data.map((address, index) => {
					return (
						<ContractData
							contractAddress={address}
							method="getClaimStatuses"
							key={index}
							callback={data => {
								return this.getClaims(data).map(claim => {
									return (
										<li key={`${claim.tokenAddress}-${claim.id}`}>
											{claim.tokenName} [{claim.tokenSymbol}] ({claim.quantity}),{' '}
											{!claim.isApproved ? (
												<a href={`/proof?tokenAddress=${claim.tokenAddress}&claimId=${claim.id}`}>submit proof</a>
											) : (
												''
											)}
										</li>
									);
								});
							}}
						/>
					);
			  })
			: [];
		return <ul>{claims}</ul>;
	};

	render() {
		return (
			<Box title="My Previous Claims">
				<ContractData
					contractName="Fin4Main"
					method="getActionsWhereUserHasClaims"
					callback={this.showClaimByActionTypes}
				/>
			</Box>
		);
	}
}

export default PreviousClaims;