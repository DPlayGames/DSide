// 일정 시간이 지난 후 데이터가 삭제되는 스토어
DSide('Data').TimeoutStore = CLASS({

	preset : () => {
		return DSide.Data.Store;
	},

	init : (inner, self) => {
		
	}
});
