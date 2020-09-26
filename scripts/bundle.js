const mime = require("mime-types");
const path = require("path");
const mainFs = require("fs");
const cp = require("child_process");
const dir = __dirname;

const walkSync = function(dir, filelist) {
    const files = mainFs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach((file) => {
        if (mainFs.statSync(dir + file).isDirectory()) {
            filelist = walkSync(dir + file + "/", filelist);
        } else {
            filelist.push(dir + file);
        }
    });
    return filelist;
};

const file_base64 = function(filename) {
    const fileBody = mainFs.readFileSync(filename);
    return fileBody.toString("base64");
};

const file_zip_base64 = function(filename) {
    cp.execSync("gzip -9 -k " + filename);
    const fileBody = mainFs.readFileSync(filename + ".gz");
    mainFs.unlinkSync(filename + ".gz");
    return fileBody.toString("base64");
};

const file_plain = function(filename) {
    const fileBody = mainFs.readFileSync(filename);
    return fileBody;
};

const header = `local data = {`;

const footer = `\n}

return {
    data = data
}`;

String.prototype.luaEscape = function() {
    return this.replace(/[\\"']/g, "\\$&")
        .replace(/\u0000/g, "\\0")
        .replace(/\n/g, "\\\n");
};

class LuaBinaryBundlePlugin {
    constructor(options) {
        this.options = Object.assign(
            {
                bundleName: "binary.lua",
                webAppPath: "",
                namespace: "",
                maxSize: 10000,
                canBeZiped: [
                    "application/json",
                    "application/javascript",
                    "text/html",
                    "font/otf",
                    "text/html",
                    false,
                ],
                canBePlain: [
                    "application/json",
                    "application/javascript",
                    "text/html",
                    false,
                ],
            },
            options
        );
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tap("LuaBinaryBundlePlugin", (compilation) => {
            const outputPath = compiler.options.output.path;
            const {
                bundleName,
                webAppPath,
                namespace,
                maxSize,
                canBeZiped,
                canBePlain,
            } = this.options;
            const buildFolder = path.relative(process.cwd(), outputPath);
            const flutterAppFolder = path.join(process.cwd(), webAppPath, 'build/web/');
            
            const files = walkSync(flutterAppFolder);

            var bundle = header;
            var fullsize = 0;
            for (const file of files) {
                const fileName = file.slice(flutterAppFolder.length);
                const fileFullPath = path.join(flutterAppFolder, fileName);

                const filesize = mainFs.lstatSync(fileFullPath)["size"];
                const fileMimeType = mime.lookup(fileName);

                var fileBody, mode;
                if (filesize < maxSize) {
                    if (canBePlain.indexOf(fileMimeType) === -1) {
                        mode = "base64";
                        fileBody = file_base64(fileFullPath);
                    } else {
                        mode = "plain";
                        fileBody = file_plain(fileFullPath);
                    }
                } else {
                    if (canBeZiped.indexOf(fileMimeType) === -1) {
                        mode = "base64";
                        fileBody = file_base64(fileFullPath);
                    } else {
                        mode = "zip64";
                        fileBody = file_zip_base64(fileFullPath);
                    }
                }

                bundle +=
                    '\n["' +
                    fileName +
                    '"] = {\n["mime"] = "' +
                    (fileMimeType ? fileMimeType : "text/plain") +
                    '",\n["mode"] = "' +
                    mode +
                    '",\n["body"] = ';
                if (mode === "plain") {
                    bundle += '"' + fileBody.toString().luaEscape() + '"';
                } else {
                    bundle += '"' + fileBody + '"';
                }
                bundle += "\n},";

                fullsize += fileBody.length;
            }

            bundle += footer;
            console.log(
                "FULL BINARY PAYLOAD SIZE: " +
                    Math.ceil(fullsize / 1024)
                        .toLocaleString()
                        .replace(/,/g, " ") +
                    " KB"
            );

            mainFs.writeFileSync(path.join(buildFolder, bundleName), bundle);
        });
    }
}

module.exports = LuaBinaryBundlePlugin;
