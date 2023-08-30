async function toggleBookmark(id) {
    const res = await fetch("/api/toggleBookmark", { method:"POST", body:JSON.stringify({ id }) });
    const apiRes = await res.json();
    if(!apiRes.error) return apiRes.bookmarks;
}

async function toggleSubscription(username) {
    const res = await fetch("/api/toggleSubscription", { method:"POST", body:JSON.stringify({ username }) });
    const apiRes = await res.json();
    if(!apiRes.error) return apiRes.subscriptions;
}

function formatDate(date) {
    if(new Date().setHours(0, 0, 0, 0) === new Date(date).setHours(0, 0, 0, 0)){
        return "Today";
    }else if(isYesterday(new Date(date))){
        return "Yesterday";
    }else if(isBeforeThisYear(new Date(date))){
        return new Date(date).toLocaleDateString("en-GB", { month:"short", day:"numeric", year:"numeric" });
    }else{
        return new Date(date).toLocaleDateString("en-GB", { month:"short", day:"numeric" });
    }
}
function isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
}
function isBeforeThisYear(date) {
    const lastYear = new Date();
    return new Date(date).getFullYear() < lastYear.getFullYear()-1;
}

function parseMentions(text){
    const regexExp = new RegExp(/(?=(<user>))(\w|\W)*(?<=<\/user>)/, "gm")
    return text.replace(regexExp, function(match) {
        return `<a href="/u/${match.trim().slice(7, -7)}" class="link">${match}</a>`;
    });
}

function fileType(fileName) {
    const imageExtensions = ["ase","art","bmp","blp","cd5","cit","cpt","cr2","cut","dds","dib","djvu","egt","exif","gif","gpl","grf","icns","ico","iff","jng","jpeg","jpg","jfif","jp2","jps","lbm","max","miff","mng","msp","nef","nitf","ota","pbm","pc1","pc2","pc3","pcf","pcx","pdn","pgm","PI1","PI2","PI3","pict","pct","pnm","pns","ppm","psb","psd","pdd","psp","px","pxm","pxr","qfx","raw","rle","sct","sgi","rgb","int","bw","tga","tiff","tif","vtf","xbm","xcf","xpm","3dv","amf","ai","awg","cgm","cdr","cmx","dxf","e2d","egt","eps","fs","gbr","odg","svg","stl","vrml","x3d","sxd","v2d","vnd","wmf","emf","art","xar","png","webp","jxr","hdp","wdp","cur","ecw","iff","lbm","liff","nrrd","pam","pcx","pgf","sgi","rgb","rgba","bw","int","inta","sid","ras","sun","tga","heic","heif"];
    const videoExtensions = ["3g2","3gp","aaf","asf","avchd","avi","drc","flv","m2v","m3u8","m4p","m4v","mkv","mng","mov","mp2","mp4","mpe","mpeg","mpg","mpv","mxf","nsv","ogg","ogv","qt","rm","rmvb","roq","svi","vob","webm","wmv","yuv"];
    return imageExtensions.includes(fileName.split('.').at(-1)) ? "image" : videoExtensions.includes(fileName.split('.').at(-1)) ? "video" : "unknown"
}

const parseMentionsOnReceive = (text) => {
    const regexExp = new RegExp(/(?=(<user>))(\w|\W)*(?<=<\/user>)/, "gm")
    return text.replace(regexExp, function(match) {
        return `<a href="/u/${match.trim().slice(7, -7)}" class="link no-anim">${match}</a> `;
    });
}

const parseMentionsOnSend = (text) => {
    const regexExp = new RegExp(/\B@\w+/g)
    return text.replace(regexExp, function(match) {
        return `<user>${match}</user> `;
    });
}

function parseLink(text) {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig
    return text.replace(urlRegex,function(url){
        if (parseUri(url).file.match(/\.(jpg|png|gif|bmp)$/i))
            return `<img src='${url}' class="max-w-full block rounded cursor-pointer" onclick="['opacity-0','-z-10','z-40','opacity-100'].map(v=> this.nextElementSibling.classList.toggle(v) )" /><div class="w-full fixed top-0 left-0 h-full bg-neutral-800/50 transition-all flex flex-col items-center justify-center opacity-0 -z-10" onclick="['opacity-0','-z-10','z-40','opacity-100'].map(v=> this.classList.toggle(v) )"><img src="${url}" class="max-w-full block rounded cursor-pointer" /></div>`;
        return '<a href="'+url+'" class="link no-anim" target="_blank">'+url+'</a>';
    });
}
function parseUri (str) {
    let o = {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   {
            name:   "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    }
    let m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
        uri = {},
        i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
        if ($1) uri[o.q.name][$1] = $2;
    });

    return uri;
};

function isElementInViewPort(element){
    let rect = element.getBoundingClientRect();

    return (rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight || document.documentElement.clientHeight && rect.right <= window.innerWidth || document.documentElement.clientWidth);
}

const formatNumber = (int) => {
    return Intl.NumberFormat("en", { notation:"compact" }).format(int);
}

export { toggleBookmark, toggleSubscription, formatDate, parseMentions, fileType, parseMentionsOnReceive, parseMentionsOnSend, parseLink, isElementInViewPort, formatNumber }