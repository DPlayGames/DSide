/*
 * 이더리움 네트워크 제공자 스토어
 * 
 * 이더리움 네트워크와 같은 IP인 경우 d를 지급받습니다.
 * 다른 IP인 경우 d를 지급하지 않습니다.
 * 메인넷만 해당합니다.
 * 테스트넷은 Infura를 사용합니다.
 */
//TODO:
DSide.EthereumNetworkProviderStore = OBJECT({
	
	init : (inner, self) => {
		
		const NETWORK_ADDRESSES = {
			Mainnet : 'wss://mainnet.infura.io/ws/v3/c1a2b959458440c780e5614fd075051b',
			Ropsten : 'wss://ropsten.infura.io/ws/v3/c1a2b959458440c780e5614fd075051b',
			Rinkeby : 'wss://rinkeby.infura.io/ws/v3/c1a2b959458440c780e5614fd075051b',
			Kovan : 'wss://kovan.infura.io/ws/v3/c1a2b959458440c780e5614fd075051b',
			Goerli : 'wss://goerli.infura.io/ws/v3/c1a2b959458440c780e5614fd075051b'
		};
		
		let Web3 = require('web3');
		
		let web3s = {};
		
		EACH(NETWORK_ADDRESSES, (networkAddress, networkName) => {
			
			let getProvider = () => {
					
				let provider = new Web3.providers.WebsocketProvider(networkAddress);
				provider.on('end', (e) => {
					SHOW_ERROR('DSide.EthereumNetworkProviderStore', 'WebsocketProvider의 접속이 끊어졌습니다. 재접속합니다.');
					web3s[networkName].setProvider(getProvider());
				});
				
				return provider;
			};
			
			web3s[networkName] = new Web3(getProvider());
		});
		
		let getWeb3 = self.getWeb3 = (networkName) => {
			return web3s[networkName];
		};
	}
});