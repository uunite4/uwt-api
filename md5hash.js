import crypto from "crypto";
export default function generateMD5Hash(input) {
  return crypto.createHash("md5").update(input).digest("hex");
}
