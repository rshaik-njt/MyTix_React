export  class CacheService {
 
	getCache(key) {
		return sessionStorage.getItem(key);
	}

	setCache(key, data) {
		sessionStorage.setItem(key, data);
	}

	removeDataFromCache(key) {
		sessionStorage.removeItem(key);
	}

	clearCache() {
		sessionStorage.clear();
	}


}