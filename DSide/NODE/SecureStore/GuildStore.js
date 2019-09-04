DSide.GuildStore = OBJECT({
	
	preset : () => {
		return DSide.SecureStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'Guild',
			
			dataStructure : {
				
				id : {
					notEmpty : true,
					size : 36
				},
				
				name : {
					notEmpty : true,
					size : {
						max : 20
					}
				},
				
				introduce : {
					size : {
						max : 256
					}
				},
				
				memberIds : {
					notEmpty : true,
					array : true
				}
			}
		};
	},
	
	init : (inner, self) => {
		
		// ID 해시 셋
		let idHashSet = {};
		
		// 특정 계정이 가입한 길드 ID
		let accountGuildIds = {};
		
		EACH(self.getDataSet(), (data, hash) => {
			idHashSet[data.id] = hash;
			
			EACH(data.memberIds, (memberId) => {
				accountGuildIds[memberId] = data.id;
			});
		});
		
		// 데이터를 저장합니다.
		let saveData;
		OVERRIDE(self.saveData, (origin) => {
			
			// 데이터 저장 시 해시를 저장합니다.
			saveData = self.saveData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.data
				//REQUIRED: params.data.id
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//REQUIRED: params.hash
				
				let id = params.data.id;
				let accountId = params.data.accountId;
				
				// d 잔고를 확인합니다.
				if (DSide.dStore.getBalance(accountId) >= 20) {
					
					let originHash = idHashSet[id];
					
					if (
					// ID에 해당하는 길드가 있으면 생성 불가
					originHash === undefined &&
					
					// 이미 길드에 가입되어있는 경우에는 불가
					accountGuildIds[accountId] === undefined &&
					
					// 최초의 멤버는 길드장이 되어야 합니다.
					params.data.memberIds.length === 1 && params.data.memberIds[0] === accountId) {
						
						let result = origin(params);
						if (result.savedData !== undefined) {
							
							idHashSet[id] = params.hash;
							accountGuildIds[accountId] = id;
							
							// 데이터 저장 완료, d를 20 깎습니다.
							DSide.dStore.use({
								accountId : accountId,
								amount : 20
							});
						}
						
						return result;
					}
					
					else {
						return {
							isNotVerified : true
						};
					}
				}
				
				else {
					return {
						isNotEnoughD : true
					};
				}
			};
		});
		
		// 데이터의 싱크를 맞춥니다.
		let syncData;
		OVERRIDE(self.syncData, (origin) => {
			
			// 데이터 싱크 시 해시를 저장합니다.
			syncData = self.syncData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.data
				//REQUIRED: params.data.id
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//OPTIONAL: params.data.lastUpdateTime
				//REQUIRED: params.hash
				
				let id = params.data.id;
				let accountId = params.data.accountId;
				
				origin(params);
				
				idHashSet[id] = params.hash;
				accountGuildIds[accountId] = id;
			};
		});
		
		// 데이터를 수정합니다.
		let updateData;
		OVERRIDE(self.updateData, (origin) => {
			
			// 데이터 수정 시 해시를 저장합니다.
			updateData = self.updateData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.originHash
				//REQUIRED: params.data
				//REQUIRED: params.data.id
				//REQUIRED: params.data.accountId
				//REQUIRED: params.data.createTime
				//REQUIRED: params.data.lastUpdateTime
				//REQUIRED: params.hash
				
				let originHash = params.originHash;
				
				let id = params.data.id;
				let accountId = params.data.accountId;
				let memberIds = params.data.memberIds;
				
				// d 잔고를 확인합니다.
				if (DSide.dStore.getBalance(accountId) >= 1) {
					
					let originData = self.getData(originHash);
					
					if (
					originData !== undefined &&
					
					// ID가 변경되어선 안됩니다.
					id === originData.id &&
					
					// 길드장은 빠지면 안됩니다.
					CHECK_IS_IN({
						array : memberIds,
						value : accountId
					}) === true) {
						
						let isNotVerified = false;
						
						// 멤버가 달라졌는지 확인
						if (CHECK_ARE_SAME([
							memberIds,
							originData.memberIds
						]) !== true) {
							
							// 새로운 멤버가 있는 경우에는, 가입 신청이 있는지 파악합니다.
							EACH(memberIds, (memberId) => {
								
								if (CHECK_IS_IN({
									array : originData.memberIds,
									value : memberId
								}) !== true) {
									
									// 가입 신청이 없으면 오류
									let requestData = DSide.GuildJoinRequestStore.getAccountRequest(memberId);
									if (requestData === undefined || requestData.guildId !== id) {
										isNotVerified = true;
									}
								}
							});
							
							if (isNotVerified !== true) {
								
								// 가입 신청 기록을 삭제하고, 신규 멤버를 추가합니다.
								EACH(memberIds, (memberId) => {
									
									if (CHECK_IS_IN({
										array : originData.memberIds,
										value : memberId
									}) !== true) {
										DSide.GuildJoinRequestStore.dropAccountRequest(memberId);
										accountGuildIds[memberId] = id;
									}
								});
								
								// 멤버를 탈퇴시킵니다.
								EACH(originData.memberIds, (memberId) => {
									
									if (CHECK_IS_IN({
										array : memberIds,
										value : memberId
									}) !== true) {
										delete accountGuildIds[memberId];
									}
								});
							}
						}
						
						if (isNotVerified === true) {
							return {
								isNotVerified : true
							};
						}
						
						else {
							
							let result = origin(params);
							if (result.savedData !== undefined) {
								
								idHashSet[id] = params.hash;
								
								// 데이터 저장 완료, d를 1 깎습니다.
								DSide.dStore.use({
									accountId : accountId,
									amount : 1
								});
							}
							
							return result;
						}
					}
					
					else {
						return {
							isNotVerified : true
						};
					}
				}
				
				else {
					return {
						isNotEnoughD : true
					};
				}
			};
		});
		
		// 데이터를 삭제합니다.
		let removeData;
		OVERRIDE(self.removeData, (origin) => {
			
			// 데이터 삭제 시 해시도 삭제합니다.
			removeData = self.removeData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.hash
				//REQUIRED: params.checkHash
				
				let result = origin(params);
				
				if (result.originData !== undefined) {
					
					delete idHashSet[result.originData.id];
					
					EACH(accountGuildIds, (accountGuildId, memberId) => {
						if (accountGuildId === result.originData.id) {
							delete accountGuildIds[memberId];
						}
					});
				}
				
				return result;
			};
		});
		
		// 데이터를 삭제합니다.
		let dropData;
		OVERRIDE(self.dropData, (origin) => {
			
			// 데이터 삭제 시 해시도 삭제합니다.
			dropData = self.dropData = (hash) => {
				
				let originData = self.getData(hash);
				
				origin(hash);
				
				if (originData !== undefined) {
					
					delete idHashSet[originData.id];
					
					EACH(accountGuildIds, (accountGuildId, memberId) => {
						if (accountGuildId === result.originData.id) {
							delete accountGuildIds[memberId];
						}
					});
				}
			};
		});
		
		// 길드 정보를 가져옵니다.
		let getGuildInfo = self.getGuildInfo = (guildId) => {
			//REQUIRED: guildId
			
			let hash = idHashSet[guildId];
			if (hash !== undefined) {
				
				return self.getData(hash);
			}
		};
		
		// 길드 해시를 가져옵니다.
		let getGuildHash = self.getGuildHash = (guildId) => {
			//REQUIRED: guildId
			
			return idHashSet[guildId];
		};
		
		// 특정 계정이 가입한 길드 정보를 가져옵니다.
		let getAccountGuildInfo = self.getAccountGuildInfo = (accountId) => {
			//REQUIRED: accountId
			
			let guildId = accountGuildIds[accountId];
			if (guildId !== undefined) {
				
				return getGuildInfo(guildId);
			}
		};
	}
});