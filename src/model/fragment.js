// Use https://www.npmjs.com/package/nanoid to create unique IDs
const { nanoid } = require('nanoid');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

var md = require('markdown-it')();

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const validTypes = {
  txt: 'text/plain',
  txtCharset: 'text/plain; charset=utf-8',
  md: 'text/markdown',
  html: 'text/html',
  json: 'application/json',
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
};

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId || !type) {
      throw Error('ownerId or type is missing!');
    }

    if (!Fragment.isSupportedType(type)) {
      throw Error('type is not supported!');
    }

    if (!Number.isInteger(size) || size < 0) {
      throw Error('size does not have a valid value!');
    }

    this.id = id || nanoid();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    try {
      return await listFragments(ownerId, expand);
    } catch (error) {
      throw new Error('Can not get fragments for the current user.');
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const fragment = await readFragment(ownerId, id);
    if (!fragment) {
      throw new Error('There is no fragment with provided ownerId or id.');
    }
    return fragment;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    try {
      this.size = Buffer.byteLength(data);
      this.updated = new Date().toISOString();
      return await writeFragmentData(this.ownerId, this.id, data);
    } catch (error) {
      throw new Error(`setting fragment data failed, ${error}`);
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.includes('text');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    let mimeTypes = [];

    switch (this.type) {
      case validTypes.txt:
      case validTypes.txtCharset:
        mimeTypes = [validTypes.txt];
        break;
      case validTypes.md:
        mimeTypes = [validTypes.md, validTypes.txt, validTypes.html];
        break;
      case validTypes.html:
        mimeTypes = [validTypes.html, validTypes.txt];
        break;
      case validTypes.json:
        mimeTypes = [validTypes.json, validTypes.txt];
        break;
      case validTypes.png:
      case validTypes.jpg:
      case validTypes.webp:
      case validTypes.gif:
        mimeTypes = [validTypes.png, validTypes.jpg, validTypes.webp, validTypes.gif];
        break;
      default:
        mimeTypes = [];
    }
    return mimeTypes;
  }
  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    return Object.values(validTypes).includes(value);
  }

  /**
   * returns true if the extension is supported
   *  */
  static isSupportedExt(value) {
    return Object.keys(validTypes).includes(value);
  }

  /**
   * return the type by using its extension
   *  */
  static extValidType(ext) {
    return validTypes[ext];
  }

  /**
   * return the converted fragment data after checking type of conversion
   *  */
  convertData(fragmentData, conversionType) {
    switch (conversionType) {
      case 'text/plain':
        return fragmentData.toString();
      case 'text/html':
        if (this.type === 'text/markdown') return md.render(fragmentData.toString());
        return fragmentData;
      default:
        return fragmentData;
    }
  }
}
module.exports.Fragment = Fragment;
