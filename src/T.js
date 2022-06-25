

export const fmt = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  
    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

export default class T {

    static currFormat = (val) => {
        return fmt.format(val);
    }

    static readFileContents = async (file) => {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = reject;
            fileReader.readAsText(file);
        });
    };

    static readAllFiles = async (AllFiles) => {
        const results = await Promise.all(
            AllFiles.map(async (file) => {
                const fileContents = await T.readFileContents(file);
                return fileContents;
            })
        );
        console.log(results, "resutls");
        return results;
    };

    // _________________________________________________ Replace All
    // VD : (string) res = T.replaceAll(res, ' ', '_', true);
    static replaceAll(source, find, replacement, toLower) {

        if (!(0 < source?.length)) {
            return source;
        }
        
        var re = new RegExp(find, 'g'); 
        var result = source.replace(re, replacement);

        if (toLower == true) {
            result = result?.toLowerCase();
        }

        return result;
    }    


    static sort_by(field, reverse, primer) {
        //const sort_by = (field, reverse, primer) => {
        const key = primer ?
        function(x) {
            return primer(x[field])
        } :
        function(x) {
            return x[field]
        };  
        reverse = !reverse ? 1 : -1;  
        return function(a, b) {
            // @ts-ignore
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
    }


    static sanitizeKey = (k) => {
        return k;
        if (k.includes('\\')) {
            console.log('sanitizeKey', k);
            return encodeURIComponent(k);
            // return T.replaceAll(k, '\\', '_');
        }
        return k;
    }


    static showStats = (entries) => {
        let ns = entries.map(p => p.mNote);
        ns = [...new Set(ns)];

        let stats = [];
        ns.forEach(n => {
            let es = entries.filter(p => p.mNote == n);
            let stat = stats?.find(p => p.mNote == n);
            // console.log('stat', !stat, stat);
            if (!stat) {
                stat = { name: n, count: es.length, tot: 0 }
                stats.push(stat);
            }
            es.forEach(e => {
                stat.tot += parseInt(e.val);
            });
        });

        stats.forEach(stat => {
            stat.tot = Math.abs(stat.tot);
            stat.totStr = T.currFormat(stat.tot);
        })

        stats = stats.sort(T.sort_by('tot', true, (p) => p));

        console.log('stats', stats);
    }


    static getNewFileHandle = async () => {
        const options = {
            types: [
              {
                description: 'Text Files',
                accept: {
                  'text/plain': ['.txt'],
                },
              },
            ],
          };
          const handle = await window.showSaveFilePicker(options);
          return handle;
    }

    static writeFile = async (contents) => {

        let fileHandle = await T.getNewFileHandle();

        // Create a FileSystemWritableFileStream to write to.
        const writable = await fileHandle.createWritable();
        // Write the contents of the file to the stream.
        await writable.write(contents);
        // Close the file and write the contents to disk.
        await writable.close();
        console.log('done writing');



        console.log('re read');
        let file = await fileHandle.getFile();        
        let reader = new FileReader();
        reader.readAsText(file);
    
        reader.onload = function() {
            let data = JSON.parse(reader.result);
            let keys = Object.keys(data);
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (!keys.includes(key)) { console.error(`!keys.includes(${key})`); }
                else {
                    const keyContent = localStorage.getItem(key);
                    if (data[key] != keyContent) { console.error(`data[key] != keyConten; key:`, key); }
                }
            }
            console.log('done');
        };
      
        reader.onerror = function() {
          console.error("ERROR", file.name, reader.error);
        };
      }
}
