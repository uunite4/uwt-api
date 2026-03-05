import { load } from "cheerio";
import validateUrl from "../urlValidator.js";

const getMetadata = async (req, res, next) => {
  const url = req.query.url;
  console.log(`/api/metadata - ${url}`);

  // REJECT URL LENGTH > 200

  try {
    const active = await validateUrl(url);
    if (!active) {
      // ERROR
      const err = new Error(`URL is not active: ${url}`);
      err.status = 400;
      return next(err);
    }

    const htmlRes = await getHtmlFromUrl(url);
    const metadata = extractMetadata(htmlRes);

    res.status(200).send(metadata);
  } catch (err) {
    // ERROR
    const errAll = new Error(`Error processing URL: ${url}`);
    errAll.status = 500;
    return next(errAll);
  }
};

export default getMetadata;

const getHtmlFromUrl = async (url) => {
  try {
    const response = await fetch(url); // Replace with your URL
    if (!response.ok) {
      // ERROR
      const errorhttp = new Error(`HTTP error! status: ${response.status}`);
      errorhttp.status = 400;
      throw errorhttp;
    }
    const htmlString = await response.text();
    // This is the HTML content as a string
    return htmlString;
  } catch (error) {
    // ERROR
    const err = new Error(`Error fetching HTML: ${error.message}`);
    err.status = error.status || 500;
    throw err;
  }
};

const extractMetadata = (htmlString) => {
  const $ = load(htmlString);

  const metadata = {
    title: $("head > title").text() || null,
    description: $('meta[name="description"]').attr("content") || null,
    ogTitle: $('meta[property="og:title"]').attr("content") || null,
    ogDescription: $('meta[property="og:description"]').attr("content") || null,
    ogImage: $('meta[property="og:image"]').attr("content") || null,
    themeColor: $('meta[name="theme-color"]').attr("content") || null,
    icon: $('link[rel="icon"]').attr("href") || null,
  };
  return metadata;
};
