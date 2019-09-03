import React, { Component } from 'react';
import Box from '../../components/Box';
import Table from '../../components/Table';
import TableRow from '../../components/TableRow';
import { RegistryAddress, PLCRVotingAddress } from '../../config/DeployedAddresses.js';
import { getContractData, getAllActionTypes } from '../../components/Contractor';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { drizzleConnect } from 'drizzle-react';
import ContractForm from '../../components/ContractForm';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isApplyModalOpen: false,
			listings: {},
			allFin4Tokens: [],
			unlistedFin4Tokens: []
		};

		this.clickedToken = null;

		getContractData(RegistryAddress, 'Registry', 'getListings').then(
			({
				0: listingsKeys,
				1: applicationExpiries,
				2: whitelistees,
				3: owners,
				4: unstakedDeposits,
				5: challengeIDs
			}) => {
				// Listings
				let listingsObj = {};
				for (var i = 0; i < listingsKeys.length; i++) {
					let address = '0x' + listingsKeys[i].substr(26, listingsKeys[i].length - 1);
					listingsObj[address] = {
						address: address,
						listingKey: listingsKeys[i],
						applicationExpiry: applicationExpiries[i],
						whitelisted: whitelistees[i],
						owner: owners[i],
						unstakedDeposit: unstakedDeposits[i],
						challengeID: challengeIDs[i],
						name: '',
						commitEndDate: '',
						revealEndDate: ''
					};
				}
				// TODO what is with those that are not in an application or challenge phase?
				let allPollPromises = Object.keys(listingsObj).map(tokenAddr => {
					let listing = listingsObj[tokenAddr];
					return getContractData(PLCRVotingAddress, 'PLCRVoting', 'pollMap', [listing.challengeID]).then(
						({ 0: commitEndDate, 1: revealEndDate, 2: voteQuorum, 3: votesFor, 4: votesAgainst }) => {
							listing.commitEndDate = new Date(commitEndDate * 1000).toLocaleString('de-CH-1996', { timeZone: 'UTC' });
							listing.revealEndDate = new Date(revealEndDate * 1000).toLocaleString('de-CH-1996', { timeZone: 'UTC' });
						}
					);
				}); // Promise.all(allPollPromises).then(results => {});

				// Unlisted Fin4 Tokens
				getAllActionTypes().then(data => {
					this.setState({ allFin4Tokens: data });
					let unlistedFin4TokensArr = [];
					for (var i = 0; i < data.length; i++) {
						// addresses are case in-sensitive. the address-to-byte32 method in Registry.applyToken() leaves only lower-case
						let tokenAddr = data[i].value.toLowerCase();
						if (!listingsObj[tokenAddr]) {
							unlistedFin4TokensArr.push(data[i]);
						} else {
							listingsObj[tokenAddr].name = data[i].label;
						}
					}
					this.setState({ listings: listingsObj });
					this.setState({ unlistedFin4Tokens: unlistedFin4TokensArr });
				});
			}
		);
	}

	toggleModal = () => {
		this.setState({ isApplyModalOpen: !this.state.isApplyModalOpen });
	};

	render() {
		return (
			<center>
				<Box title="Listings">
					<Table headers={['Name', 'Status', 'Due Date', 'Actions']}>
						{Object.keys(this.state.listings).map((key, index) => {
							return (
								<TableRow
									key={index}
									data={{
										name: this.state.listings[key].name,
										status: 'TODO',
										dueDate: this.state.listings[key].commitEndDate,
										actions: 'TODO'
									}}
								/>
							);
						})}
					</Table>
				</Box>
				<Modal
					isOpen={this.state.isApplyModalOpen}
					handleClose={this.toggleModal}
					title="Set deposit and data"
					width="400px">
					<ContractForm
						contractAddress={RegistryAddress}
						contractName="Registry"
						method="applyToken"
						staticArgs={{
							tokenAddress: this.clickedToken
						}}
						labels={['Token', 'Deposit', 'Data']}
						postSubmitCallback={this.toggleModal}
					/>
				</Modal>
				<Box title="Unlisted Fin4 Tokens">
					<Table headers={['Name', 'Apply']}>
						{this.state.unlistedFin4Tokens.map((entry, index) => {
							return (
								<TableRow
									key={index}
									data={{
										name: entry.label,
										apply: (
											<Button
												onClick={() => {
													this.clickedToken = entry.value;
													this.toggleModal();
												}}>
												Apply
											</Button>
										)
									}}
								/>
							);
						})}
					</Table>
				</Box>
			</center>
		);
	}
}

const inputFieldStyle = {
	// copied from ContractForm
	width: '100%',
	marginBottom: '15px'
};

export default drizzleConnect(Home);