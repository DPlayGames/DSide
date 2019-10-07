DSide.GuildMemberStore = OBJECT({
	
	preset : () => {
		return DSide.TargetStore;
	},
	
	params : () => {
		
		return {
			
			storeName : 'GuildMember',
			
			dataStructure : {}
		};
	},
	
	init : (inner, self) => {
		
		// 특정 계정이 가입한 길드 ID
		let accountGuildIds = {};
		
		EACH(self.getTargetHashSet(), (hash, target) => {
			EACH(self.getDataSet(target), (data, id) => {
				accountGuildIds[id] = target;
			});
		});
		
		// 특정 계정이 가입한 길드 ID를 가져옵니다.
		let getAccountGuildId = self.getAccountGuildId = (accountId) => {
			//REQUIRED: accountId
			
			return accountGuildIds[accountId];
		};
		
		// 길드장을 멤버로 등록합니다.
		let addGuildOwnerToMember = self.addGuildOwnerToMember = (params) => {
			//REQUIRED: params
			//REQUIRED: params.target
			//REQUIRED: params.id
			
			let target = params.target;
			let id = params.id;
			
			let guildInfo = DSide.GuildStore.getGuild(target);
			
			// 길드장만 길드 멤버를 생성할 수 있습니다.
			if (guildInfo !== undefined && self.getData({
				target : target,
				id : id
			}) === undefined) {
				
				originSaveData({
					id : id,
					data : {
						target : target,
						createTime : guildInfo.createTime
					}
				});
				
				accountGuildIds[id] = target;
			}
		};
		
		let originSaveData = self.saveData;
		
		// 데이터를 저장합니다.
		let saveData;
		OVERRIDE(self.saveData, (origin) => {
			
			saveData = self.saveData = (params) => {
				//REQUIRED: params.id
				//REQUIRED: params.data
				//REQUIRED: params.data.target
				//REQUIRED: params.data.createTime
				//REQUIRED: params.hash
				
				let id = params.id;
				let data = params.data;
				let hash = params.hash;
				
				let guildInfo = DSide.GuildStore.getGuild(data.target);
				
				// 길드장만 길드 멤버를 생성할 수 있습니다.
				if (guildInfo !== undefined && DSide.GuildJoinRequestStore.checkRequestExists({
					guildId : data.target,
					accountId : id
				}) === true && DSide.Verify({
					accountId : guildInfo.accountId,
					data : data,
					hash : hash
				}) === true) {
					
					accountGuildIds[id] = data.target;
					
					DSide.GuildJoinRequestStore.acceptedRequest({
						guildId : data.target,
						accountId : id
					});
					
					return origin(params);
				}
				
				else {
					return {
						isNotVerified : true
					};
				}
			};
		});
		
		// 데이터의 싱크를 맞춥니다.
		let syncData;
		OVERRIDE(self.syncData, (origin) => {
			
			// 데이터 싱크 시 해시를 저장합니다.
			syncData = self.syncData = (params) => {
				//REQUIRED: params.id
				//REQUIRED: params.data
				//REQUIRED: params.data.target
				//REQUIRED: params.data.createTime
				//OPTIONAL: params.data.lastUpdateTime
				
				let id = params.id;
				let target = params.data.target;
				
				origin(params);
				
				accountGuildIds[id] = target;
			};
		});
		
		// 데이터 수정 기능을 제거합니다.
		delete self.updateData;
		
		// 데이터 삭제는 길드장 혹은 길드원만 가능합니다.
		let removeData;
		OVERRIDE(self.removeData, (origin) => {
			
			removeData = self.removeData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.target
				//REQUIRED: params.id
				//REQUIRED: params.hash
				
				let target = params.target;
				let id = params.id;
				let hash = params.hash;
				
				let originData = self.getData({
					target : target,
					id : id
				});
				
				if (originData !== undefined) {
					
					let guildInfo = DSide.GuildStore.getGuild(target);
					
					// 길드장 혹은 길드원만 삭제가 가능합니다.
					// 길드장은 스스로를 내보낼 수 없습니다.
					if (guildInfo !== undefined && id !== guildInfo.accountId && (DSide.Verify({
						accountId : guildInfo.accountId,
						data : id,
						hash : hash
					}) === true || DSide.Verify({
						accountId : id,
						data : id,
						hash : hash
					}) === true)) {
						
						delete accountGuildIds[id];
						
						return origin(params);
					}
					
					else {
						return {
							isNotVerified : true
						};
					}
				}
				
				else {
					return {
						isNotVerified : true
					};
				}
			};
		});
		
		let dropData;
		OVERRIDE(self.dropData, (origin) => {
			
			dropData = self.dropData = (params) => {
				//REQUIRED: params
				//REQUIRED: params.target
				//REQUIRED: params.id
				
				let id = params.id;
				
				origin(params);
				
				delete accountGuildIds[id];
			};
		});
		
		// 회원수 순으로 길드 ID들을 가져옵니다.
		let getGuildIdsByMemberCount = self.getGuildIdsByMemberCount = () => {
			
			let list = [];
			
			EACH(self.getTargetHashSet(), (hash, target) => {
				list.push({
					guildId : target,
					memberCount : COUNT_PROPERTIES(self.getDataSet(target))
				});
			});
			
			// 회원수 순으로 정렬
			list.sort((a, b) => {
				if (a.memberCount > b.memberCount) {
					return -1;
				}
				if (a.memberCount < b.memberCount) {
					return 1;
				}
				return 0;
			});
			
			let guildIds = [];
			
			EACH(list, (info) => {
				guildIds.push(info.guildId);
			});
			
			return guildIds;
		};
		
		// 길드원들의 ID들을 가져옵니다.
		let getGuildMemberIds = self.getGuildMemberIds = (guildId) => {
			//REQUIRED: guildId
			
			let memberIds = [];
			
			EACH(self.getDataSet(guildId), (memberInfo, memberId) => {
				memberIds.push(memberId);
			});
			
			return memberIds;
		};
	}
});