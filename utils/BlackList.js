const blacklist = new Set();

class BlackList{
    static isBlacklisted = (token) => {
        return blacklist.has(token);
    }

    static add = (token) => {
        blacklist.add(token);
    }



}

export default BlackList ;