import { db, auth, getDocs, collection, doc, writeBatch, query, where } from './firebase-config.js';

export const runMigration = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.error("[Migration] No user logged in.");
        return;
    }
    const uid = user.uid;
    console.log(`[Migration] Starting for user: ${uid}`);

    try {
        const txSnap = await getDocs(collection(db, 'users', uid, 'transactions'));
        const batch = writeBatch(db);
        let count = 0;

        txSnap.docs.forEach(d => {
            const data = d.data();
            let changed = false;
            const updates = {};

            if (data.payer === '我') {
                updates.payer = uid;
                changed = true;
            }
            if (data.beneficiaries && data.beneficiaries.includes('我')) {
                updates.beneficiaries = data.beneficiaries.map(b => b === '我' ? uid : b);
                changed = true;
            }

            if (changed) {
                batch.update(d.ref, updates);
                count++;
            }
        });

        if (count > 0) {
            await batch.commit();
            console.log(`[Migration] Successfully updated ${count} transactions.`);
        } else {
            console.log("[Migration] No transactions needed updating.");
        }
    } catch (e) {
        console.error("[Migration] Failed", e);
    }
};
