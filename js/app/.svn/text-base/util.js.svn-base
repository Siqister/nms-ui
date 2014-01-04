define([], function () {
    Date.prototype.toLocalISOString = function(){
        // ISO 8601
        var d = this
                , pad = function (n){return n<10 ? '0'+n : n}
                , tz = d.getTimezoneOffset() //mins
                , tzs = (tz>0?"-":"+") + pad(parseInt(tz/60))

        if (tz%60 != 0)
            tzs += pad(tz%60)

        if (tz === 0) // Zulu time == UTC
            tzs = 'Z'

        return d.getFullYear()+'-'
                + pad(d.getMonth()+1)+'-'
                + pad(d.getDate())+'T'
                + pad(d.getHours())+':'
                + pad(d.getMinutes())+':'
                + pad(d.getSeconds()) +"Z" //+ tzs
    }

    Number.prototype.ordinate = function(){
        var num = this,
                numStr = num.toString(),
                last = numStr.slice(-1),
                len = numStr.length,
                ord = '';
        switch (last) {
            case '1':
                ord = numStr.slice(-2) === '11' ? 'th' : 'st';
                break;
            case '2':
                ord = numStr.slice(-2) === '12' ? 'th' : 'nd';
                break;
            case '3':
                ord = numStr.slice(-2) === '13' ? 'th' : 'rd';
                break;
            default:
                ord = 'th';
                break;
        }
        return num.toString() + ord;
    };
})




