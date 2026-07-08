function computeCacheKey(path, body) {
  var raw = path + '::' + JSON.stringify(body)
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw)
  return digest
    .map(function (b) {
      var v = (b < 0 ? b + 256 : b).toString(16)
      return v.length === 1 ? '0' + v : v
    })
    .join('')
}

function getCacheFolder_() {
  var props = PropertiesService.getScriptProperties()
  var folderId = props.getProperty('CACHE_FOLDER_ID')
  if (folderId) {
    return DriveApp.getFolderById(folderId)
  }
  var folders = DriveApp.getFoldersByName('vocab-chunk-trainer-cache')
  if (folders.hasNext()) {
    return folders.next()
  }
  var created = DriveApp.createFolder('vocab-chunk-trainer-cache')
  props.setProperty('CACHE_FOLDER_ID', created.getId())
  return created
}

function getCachedResponse(cacheKey) {
  var folder = getCacheFolder_()
  var files = folder.getFilesByName(cacheKey + '.json')
  if (!files.hasNext()) return null
  var file = files.next()
  return JSON.parse(file.getBlob().getDataAsString())
}

function saveCachedResponse(cacheKey, data) {
  var folder = getCacheFolder_()
  var existing = folder.getFilesByName(cacheKey + '.json')
  while (existing.hasNext()) {
    existing.next().setTrashed(true)
  }
  folder.createFile(cacheKey + '.json', JSON.stringify(data), MimeType.PLAIN_TEXT)
}
