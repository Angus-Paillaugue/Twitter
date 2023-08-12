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
        return new Date(date).toLocaleDateString("en-GB", { month:"long", day:"numeric" });
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

export { toggleBookmark, toggleSubscription, formatDate, parseMentions, fileType }