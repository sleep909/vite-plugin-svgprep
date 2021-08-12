const fs = require("fs");
const path = require("path");
const shell = require("shelljs");
const xmldom = require("xmldom");
const parser = new xmldom.DOMParser();
const serializer = new xmldom.XMLSerializer();

module.exports = (props) => {
  if (!props) props = {};
  const scan = props.scan || "";
  const root = props.root || process.cwd();
  const resolve = (p) => path.resolve(root, p);

  const svgExtension = /\.svg$/;

  return {
    name: "vite-plugin-svgprep",

    transformIndexHtml(src) {
      const html = parser.parseFromString(src, "text/html");
      const svgprep = html.getElementsByTagName("svgprep");
      if (svgprep.length < 1 && !scan) return;

      let scanList = [];
      let pageScan = "";
      if (scan) scanList.push(resolve(scan));
      if (svgprep.length > 0) {
        pageScan = svgprep[0].getAttribute("scan");
        if (pageScan.charAt(0) == "/") pageScan = pageScan.substring(1);
        scanList.push(resolve(pageScan));
        for (let i = 0; i < svgprep.length; i++) {
          html.removeChild(svgprep[i]);
        }
      }

      let scannedSvgs = {};
      for (const dir in scanList) {
        shell.ls(scanList[dir]).forEach((file) => {
          if (!file.match(svgExtension)) return;
          const name = path.basename(file, ".svg");
          const icon = parser.parseFromString(
            fs.readFileSync(resolve(`${scanList[dir]}/${file}`)).toString(),
            "image/svg+xml"
          );
          const svg = icon.getElementsByTagName("svg")[0];
          svg.setAttribute("id", `svg-${name}`);
          svg.setAttribute("fill", "inherit");
          svg.setAttribute("stroke", "inherit");
          svg.removeAttribute("height");
          svg.removeAttribute("width");
          scannedSvgs[name] = svg;
        });
      }

      const body = html.getElementsByTagName("body")[0];
      const svg = html.createElement("svg");
      svg.setAttribute("style", "display: none;");
      for (const s in scannedSvgs) svg.appendChild(scannedSvgs[s]);
      body.appendChild(svg);

      return serializer.serializeToString(html);
    },
  };
};
