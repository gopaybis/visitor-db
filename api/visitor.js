export default async function handler(req, res) {
  const GITHUB_REPO = "gopaybis/visitor-db";
  const FILE_PATH = "count.json";
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN1;

  async function getCount() {
    const raw = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/${FILE_PATH}`);
    const json = await raw.json();
    return json.visitorCount || 0;
  }

  async function updateCount(newCount) {
    const shaRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    });
    const { sha } = await shaRes.json();

    const body = {
      message: "Update visitor count",
      content: Buffer.from(JSON.stringify({ visitorCount: newCount }, null, 2)).toString('base64'),
      sha
    };

    return fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  }

  try {
    let count = await getCount();
    count++;
    await updateCount(count);
    res.setHeader("Content-Type", "text/plain");
    res.status(200).send(`👥 Total pengunjung: ${count}`);
  } catch (err) {
    res.status(500).send("❌ Gagal update: " + err.message);
  }
}
