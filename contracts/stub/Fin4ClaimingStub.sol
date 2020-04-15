pragma solidity ^0.5.0;

contract Fin4ClaimingStub {

    function claimApprovedPingback(address tokenAddress, address claimer, uint claimId, uint quantity, bool Fin4ClaimingHasMinterRole) public;

    function proofApprovalPingback(address tokenAddrToReceiveVerifierDecision, address proofTypeAddress, uint claimId, address claimer) public;

    function proofAndClaimRejectionPingback(address tokenAddress, uint claimId, address claimer) public;

}
