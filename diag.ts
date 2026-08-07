import { db } from "./lib/firebase-admin";

async function diag() {
    console.log("Checking Firestore database...");
    try {
        const snapshot = await db.collection("posts").orderBy("publishAt", "desc").limit(5).get();
        console.log(`Found ${snapshot.docs.length} recent posts:`);
        snapshot.docs.forEach(doc => {
            const data = doc.data();
            console.log(`- [${data.publishAt}] ${data.slug}: "${data.title}" (Content length: ${data.content?.length || 0})`);
        });
    } catch (e) {
        console.error("DIAG FAIL:", e);
    }
}

diag();
