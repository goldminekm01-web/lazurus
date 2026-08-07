const admin = require("firebase-admin");

const serviceAccount = {
  "project_id": "lazurus-news-26ab2",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDSO4fFG5z+/vu4\nmvLhupuVZmx2HGRt7pVbIt1fYOCZzYQxSYFonOgMqTOynvGsTUT5ziDSrZiD2nJg\nFWSZ7arVSgscZG3gusqOV9In9I225KMtSuGUcHYyHJKXDuiWMpOwTerdCoclV9H6\nFhEXOUsTzm8GMaEPVPKsSUdlEqtH2xk+NbPmLR8zB279T/XrIlXLhy9GqAzJGPpL\nfuhTwFcuUby4bFXIWoUWOjREWmA4p1C7GtlXvnaZTXsSZ5l2i4VHTxE7ZPwiXReL\n8i680SDEZkQMhbmlWym0571y1XwdeV3SnPxfhzh0KpZNYesOelkl0ax26HjG1C8O\nzIjqsXQRAgMBAAECggEAFWJhSdMoecahf7JhLMVQwJZhx3TVYVpAnnvSJTrDNdnS\nDbpim6vELc+DNvLUddiJQNiu/YcTaawNcMkUSdUDSL1Gmo17oL2XT3nO4moNhTJG\nB9wjTHhRCYFfBtcJIQgFfkw6rN++hfWkIepfNCvLf3kC0ZA4SAk1wwEULkuDGSSY\noe44TYAiL3GLsamlm9NaERge7ng//28bWndxTcHd9vdsu9Xhe/WYCl4OnmU3AwP5\nJ2T2/2kxuYOZH85UKIkTQrZgWnFZEXjU6SFjiQ3QN8kumwhajXF8EHRRfF2hY00S\nDv49b7HQ7VbZHsj0IvaWsIKVtBgvma4kchEpIjcpHQKBgQD4xWdCX2aj2e9AI9Vm\nir3mYbB0pnA1SIHKZQ9Jw5lcoO9Df0Ts8HB1pw0U3A/KMRAcCLPPa2o6LGpKIMwp\nebPzy6lbyKkKXuCkuoWHeIIXgdH51u53k2zDfh0F+b/ltqM5V1YSUI1roz/ayhMl\nw/EWszqUj9ZtlAfR5ghvnIj8TQKBgQDYV3C+A/0hgyLfb1mocdt6KJhy7NLuX5vG\nVraYiSz4dzsQokkktFnF21U3H2j00S9DZBEPV7k9HkF5LrAgzCrrP0YB6g/X9tCV\nRDeG4t5TBIZanj0sIYCCsRa8jeJln6n+pxoVCvtZxpXxB/m9vRngi+fzdiIeBU+Z\nagbdAjmo1QKBgDde4MPiLhtMN7dkAmyndusfVUIxhYomkFT3N3bopWr7myW/3xyJ\ny840F3JMJOuRDg/fU/5X3zYBisrjD+4vW4FpFFIMkKtxQLkJlwz3IqWOzKi6USum\nUbAVkuowk6jShPQPX2YGLeQGWwEctzRRr4io7eIBPe334+GxPLFy+v6FAoGAJJNj\n9DwoZ6oME0p4Fgpp2NVUMNnpL3PqmjW+2TsX50oBKmbFhvcW1mSmm5Mr43gaTYJ1\nf+qM3tBmsV47WNAr0Wn5JAm2dAS+bv4BhUSF4fM548gs/3EKkQ3vkiFKzXOZAfyu\nZDBfHmZ8oyt+BZ4a6eO9a2PlkL3FH2LVljfyF6ECgYEA7r7zVxltfFPEP3F8e1BK\nDY/ZzhrdT+dhmWAr36CjRuOac7UqGDwMYNwjpGKM6I8StgZ7X1AmlM2LcRH/A+tw\nWd9S5PrKHD+BRiRewWclHcPj8s5pEc4l4OLQI45kCP7OI6MARMVH3CBeur46naMu\nLjP9bXeCWdoSK5MaCbIWbD0=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@lazurus-news-26ab2.iam.gserviceaccount.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function diag() {
    console.log("Checking Firestore database (lazurus-news-26ab2)...");
    try {
        const snapshot = await db.collection("posts").orderBy("publishAt", "desc").limit(10).get();
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
