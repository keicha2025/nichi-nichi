import {
    db, auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider,
    collection, doc, setDoc, addDoc, getDocs, updateDoc, deleteDoc, query, orderBy, where, getDoc, writeBatch, arrayUnion, arrayRemove, collectionGroup,
    reauthenticateWithPopup, serverTimestamp, deleteField
} from './firebase-config.js';

import { CONFIG } from './config.js?v=1.3';

export const DEFAULTS = {
    categories: [
        { id: 'cat_001', name: '外食', icon: 'restaurant', type: '支出', order: 1 },
        { id: 'cat_002', name: '交通', icon: 'directions_bus', type: '支出', order: 2 },
        { id: 'cat_003', name: '日常', icon: 'home', type: '支出', order: 3 },
        { id: 'cat_004', name: '繳費', icon: 'barcode_scanner', type: '支出', order: 4 },
        { id: 'cat_005', name: '學習', icon: 'school', type: '支出', order: 5 },
        { id: 'cat_006', name: '娛樂', icon: 'confirmation_number', type: '支出', order: 6 },
        { id: 'cat_007', name: '購物', icon: 'shopping_cart', type: '支出', order: 7 },
        { id: 'cat_008', name: '其他', icon: 'add_card', type: '支出', order: 8 },
        { id: 'cat_009', name: '獎學金', icon: 'payments', type: '收入', order: 9 },
        { id: 'cat_010', name: '其他', icon: 'add_card', type: '收入', order: 10 }
    ],
    paymentMethods: [
        { id: 'pm_001', name: '刷卡', icon: 'credit_card', order: 1 },
        { id: 'pm_002', name: '現金', icon: 'payments', order: 2 },
        { id: 'pm_003', name: '電支', icon: 'qr_code', order: 3 },
        { id: 'pm_004', name: '轉帳', icon: 'currency_exchange', order: 4 }
    ],
    friends: [],
    config: { user_name: '', fx_rate: 0.21 }
};

// Helper: Get Current User or throw
const getCurrentUser = () => {
    const user = auth.currentUser;
    if (!user) return null;
    return user;
};

export const API = {
    db,
    auth,
    // Firestore Functions
    doc,
    getDoc,
    getDocs,
    collection,
    query,
    where,
    orderBy,
    setDoc,
    updateDoc,
    deleteDoc,
    collectionGroup,
    writeBatch,
    arrayUnion,
    arrayRemove,
    serverTimestamp,
    deleteField,
    // Auth wrappers
    async login() {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result.user;
        } catch (error) {
            console.error("Login Failed", error);
            throw error;
        }
    },

    async reauthenticate() {
        try {
            const user = auth.currentUser;
            if (!user) throw new Error("No user logged in");
            const result = await reauthenticateWithPopup(user, googleProvider);
            return result.user;
        } catch (error) {
            console.error("Re-auth Failed", error);
            throw error;
        }
    },

    async logout() {
        await signOut(auth);
    },

    onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
    },

    async requestIncrementalScope() {
        try {
            const provider = new GoogleAuthProvider();
            provider.addScope('https://www.googleapis.com/auth/spreadsheets');
            provider.addScope('https://www.googleapis.com/auth/drive.file');

            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            if (token) {
                sessionStorage.setItem('google_access_token_v4', token);
                sessionStorage.setItem('google_token_expiry', Date.now() + 3500 * 1000);
                return token;
            }
            return null;
        } catch (error) {
            console.error("Scope Request Failed", error);
            throw error;
        }
    },

    getGoogleToken() {
        const token = sessionStorage.getItem('google_access_token_v4');
        const expiry = sessionStorage.getItem('google_token_expiry');
        if (token && expiry && Date.now() < parseInt(expiry)) {
            return token;
        }
        return null;
    },

    invalidateGoogleToken() {
        sessionStorage.removeItem('google_access_token_v4');
        sessionStorage.removeItem('google_token_expiry');
    },

    // Data Access
    async fetchInitialData() {
        const user = getCurrentUser();
        if (!user) {
            return {
                categories: [],
                friends: [],
                transactions: [],
                projects: [],
                stats: {},
                config: { user_name: 'Guest', fx_rate: DEFAULTS.config.fx_rate }
            };
        }

        const uid = user.uid;
        const email = user.email;

        try {
            const userDocRef = doc(db, 'users', uid);

            // Parallel Fetch: Config & Transactions & Projects Subcollection
            const [userSnapshot, txSnapshot, projSnapshot] = await Promise.all([
                getDoc(userDocRef),
                getDocs(query(collection(db, 'users', uid, 'transactions'), orderBy('spendDate', 'desc'))),
                getDocs(collection(db, 'users', uid, 'projects'))
            ]);

            let config = DEFAULTS.config;
            let friends = DEFAULTS.friends;
            let userData = null;

            if (userSnapshot.exists()) {
                const data = userSnapshot.data();
                userData = data; // Assign existing data to userData
                config = { ...config, ...data.config };
                friends = data.friends || [];

                // [Upgrade] Ensure email and invite_token exist
                let needsUpdate = false;
                if (config.email !== email) {
                    config.email = email;
                    needsUpdate = true;
                }
                if (!config.invite_token) {
                    config.invite_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                    needsUpdate = true;
                }
                if (needsUpdate) {
                    await updateDoc(userDocRef, { config });
                }
            } else {
                // Initialize User Doc
                config.email = email;
                config.invite_token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                userData = {
                    config,
                    categories: DEFAULTS.categories,
                    paymentMethods: DEFAULTS.paymentMethods,
                    friends: [],
                    projects: [],
                    createdAt: serverTimestamp()
                };
                await setDoc(userDocRef, userData);
            }

            // Migration: Move projects from array in user doc to subcollection
            let userProjects = (projSnapshot.docs || []).map(d => ({ ...d.data(), id: d.id }));

            if (userData && userData.projects && userData.projects.length > 0) {
                console.log("[API] Migrating projects from array to subcollection...");
                const batch = writeBatch(db);
                userData.projects.forEach(p => {
                    const projectRef = doc(db, 'users', uid, 'projects', p.id);
                    batch.set(projectRef, { ...p, collaborators: p.collaborators || [] });
                });
                batch.update(userDocRef, { projects: deleteField() });
                await batch.commit();

                const newProjSnap = await getDocs(collection(db, 'users', uid, 'projects'));
                userProjects = newProjSnap.docs.map(d => ({ ...d.data(), id: d.id }));
            }

            // Update userData with potentially migrated projects
            if (userData) {
                userData.projects = userProjects;
            }


            const transactions = txSnapshot.docs.map(doc => {
                const data = doc.data();
                // [Consistency] Map UID back to '我' if it belongs to current user
                if (data.payer === uid) data.payer = '我';
                if (data.beneficiaries) {
                    data.beneficiaries = data.beneficiaries.map(b => b === uid ? '我' : b);
                }
                return { id: doc.id, ...data };
            });

            // --- FETCH COLLABORATIVE DATA ---
            const sharedProjSnap = await getDocs(query(collectionGroup(db, 'projects'), where('collaborators', 'array-contains', uid)));

            const sharedProjects = [];
            const sharedTransactions = [];

            for (const pDoc of sharedProjSnap.docs) {
                const pData = pDoc.data();
                const hostId = pDoc.ref.parent.parent.id;
                if (hostId === uid) continue;

                const sharedProject = { ...pData, id: pDoc.id, hostId, isCollaborative: true };
                sharedProjects.push(sharedProject);

                const stxSnap = await getDocs(query(collection(db, 'users', hostId, 'transactions'), where('projectId', '==', pDoc.id)));
                stxSnap.docs.forEach(d => {
                    const data = d.data();

                    // [Sharing Logic] If mode is RELATED, filter out transactions not involving this user
                    if (pData.sharingMode === 'RELATED') {
                        const isPayer = data.payer === uid;
                        const isBeneficiary = data.beneficiaries && data.beneficiaries.includes(uid);
                        if (!isPayer && !isBeneficiary) return;
                    }

                    // [Consistency] If payer is the host, mark it so we can resolve it later
                    // If not host and not '我', it's likely another collaborator or friend
                    if (data.payer === hostId) data.payerIsHost = true;

                    if (data.payer === uid) data.payer = '我';
                    if (data.beneficiaries) {
                        data.beneficiaries = data.beneficiaries.map(b => b === uid ? '我' : b);
                    }
                    sharedTransactions.push({ id: d.id, ...data, hostId });
                });
            }

            return {
                categories: userData.categories || DEFAULTS.categories,
                paymentMethods: userData.paymentMethods || DEFAULTS.paymentMethods,
                friends: userData.friends || [],
                projects: [...(userData.projects || []), ...sharedProjects],
                config: userData.config || {},
                transactions: [...transactions, ...sharedTransactions],
                stats: {}
            };

        } catch (error) {
            console.error("Firestore Error:", error);
            throw error;
        }
    },

    async saveTransaction(payload) {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");

        const uid = user.uid;
        const userRef = doc(db, 'users', uid);

        if (payload.action === 'updateConfig') {
            await updateDoc(userRef, {
                'config.user_name': payload.user_name,
                'config.fx_rate': payload.fx_rate,
                'config.auto_backup': payload.auto_backup ?? false
            });
            return true;
        }

        if (payload.action === 'renameFriend') {
            const { oldName, newName, id } = payload;
            if (!newName) return false;

            const userSnap = await getDoc(userRef);
            let friends = userSnap.data().friends || [];
            const idx = friends.findIndex(f => (id && f.id === id) || (typeof f === 'string' ? f : f.name) === oldName);

            if (idx !== -1) {
                if (typeof friends[idx] === 'string') {
                    friends[idx] = { id: id || ("f_" + Date.now()), name: newName, visible: true };
                } else {
                    friends[idx].name = newName;
                    if (id) friends[idx].id = id;
                }
                await updateDoc(userRef, { friends });
            }

            const transactionsSnap = await getDocs(collection(userRef, 'transactions'));
            const batch = writeBatch(db);
            let count = 0;

            transactionsSnap.docs.forEach(doc => {
                const t = doc.data();
                let needsUpdate = false;
                const updateData = {};

                if (t.payer === oldName) {
                    updateData.payer = newName;
                    needsUpdate = true;
                }

                if (t.friendName) {
                    if (t.friendName === oldName) {
                        updateData.friendName = newName;
                        needsUpdate = true;
                    } else if (t.friendName.includes(oldName)) {
                        const regex = new RegExp('\\b' + oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
                        if (regex.test(t.friendName)) {
                            updateData.friendName = t.friendName.replace(regex, newName);
                            needsUpdate = true;
                        }
                    }
                }

                if (needsUpdate) {
                    batch.update(doc.ref, updateData);
                    count++;
                }
            });

            if (count > 0) await batch.commit();
            return true;
        }

        if (payload.action === 'updateProject') {
            const hostId = payload.hostId || uid;
            const projectRef = payload.id ? doc(db, 'users', hostId, 'projects', payload.id) : doc(collection(db, 'users', hostId, 'projects'));

            const { action, ...dataToSave } = payload;
            const finalPayload = { ...dataToSave, updatedAt: new Date().toISOString() };

            Object.keys(finalPayload).forEach(key => finalPayload[key] === undefined && delete finalPayload[key]);

            if (!payload.id) {
                finalPayload.id = projectRef.id;
                finalPayload.collaborators = [];
                finalPayload.createdAt = new Date().toISOString();
                finalPayload.status = finalPayload.status || 'Active';
            }

            await setDoc(projectRef, finalPayload, { merge: true });
            return true;
        }

        if (payload.action === 'delete') {
            if (!payload.id) throw new Error("Missing ID for deletion");
            const targetUid = payload.hostId || uid;
            await deleteDoc(doc(db, 'users', targetUid, 'transactions', payload.id));
            return true;
        }

        const { action, row, token, hostId, ...dataToSave } = payload;
        const targetUid = hostId || uid;

        if (action === 'edit' && payload.id) {
            await setDoc(doc(db, 'users', targetUid, 'transactions', payload.id), dataToSave, { merge: true });
        } else {
            const txId = payload.id || `tx_${Date.now()}`;
            await setDoc(doc(db, 'users', targetUid, 'transactions', txId), dataToSave);
        }
        return true;
    },

    async updateUserData(data) {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        const userRef = doc(db, 'users', user.uid);
        const updates = {};
        if (data.categories) updates.categories = data.categories;
        if (data.paymentMethods) updates.paymentMethods = data.paymentMethods;
        if (data.friends) updates.friends = data.friends;
        await updateDoc(userRef, updates);
        return true;
    },

    async deleteMultipleTransactions(ids) {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        const uid = user.uid;
        const chunkSize = 450;
        for (let i = 0; i < ids.length; i += chunkSize) {
            const batch = writeBatch(db);
            const chunk = ids.slice(i, i + chunkSize);
            chunk.forEach(id => {
                const ref = doc(db, 'users', uid, 'transactions', id);
                batch.delete(ref);
            });
            await batch.commit();
        }
        return true;
    },

    async getSharedLinks() {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        const snapshot = await getDocs(collection(db, 'users', user.uid, 'shared_links'));
        return snapshot.docs.map(doc => doc.data());
    },

    async createSharedLink(config) {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        const linkId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const linkData = { id: linkId, createdAt: new Date().toISOString(), ...config };
        const batch = writeBatch(db);
        const linkRef = doc(db, 'users', user.uid, 'shared_links', linkId);
        batch.set(linkRef, linkData);
        batch.update(doc(db, 'users', user.uid), { activeSharedIds: arrayUnion(linkId) });
        await batch.commit();
        return linkId;
    },

    async deleteSharedLink(linkId) {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        const batch = writeBatch(db);
        batch.delete(doc(db, 'users', user.uid, 'shared_links', linkId));
        batch.update(doc(db, 'users', user.uid), { activeSharedIds: arrayRemove(linkId) });
        await batch.commit();
    },

    async updateSharedLink(linkId, config) {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        await updateDoc(doc(db, 'users', user.uid, 'shared_links', linkId), config);
    },

    async fetchSharedData(linkId, targetUid = null) {
        try {
            let uid = targetUid;
            let linkConfig = null;
            if (uid) {
                const linkSnap = await getDoc(doc(db, 'users', uid, 'shared_links', linkId));
                if (!linkSnap.exists()) throw new Error("Link configuration not found.");
                linkConfig = linkSnap.data();
            } else {
                const linkQuery = query(collectionGroup(db, 'shared_links'), where('id', '==', linkId));
                const linkQuerySnapshot = await getDocs(linkQuery);
                if (linkQuerySnapshot.empty) throw new Error("Shared link is invalid or expired.");
                const linkSnap = linkQuerySnapshot.docs[0];
                linkConfig = linkSnap.data();
                uid = linkSnap.ref.parent.parent.id;
            }
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (!userDoc.exists()) throw new Error("Owner user not found.");
            return this._fetchDataForUser(userDoc, linkConfig);
        } catch (error) {
            console.error("Fetch Shared Data Error", error);
            throw error;
        }
    },

    async _fetchDataForUser(userDoc, linkConfig) {
        const uid = userDoc.id;
        const userData = userDoc.data();
        let qTx = query(collection(db, 'users', uid, 'transactions'), orderBy('spendDate', 'desc'));
        const txSnapshot = await getDocs(qTx);
        let transactions = txSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (linkConfig.scope === 'range' && linkConfig.scopeValue) {
            const { start, end } = linkConfig.scopeValue;
            if (start) transactions = transactions.filter(t => t.spendDate >= start);
            if (end) transactions = transactions.filter(t => t.spendDate <= end);
        }
        if (linkConfig.scope === 'project' && linkConfig.scopeValue) {
            transactions = transactions.filter(t => t.projectId === linkConfig.scopeValue);
        }
        if (linkConfig.scope !== 'project' && linkConfig.excludeProjectExpenses) {
            transactions = transactions.filter(t => !t.projectId);
            userData.projects = [];
        }

        if (linkConfig.hideFriendNames) {
            const currentUid = auth.currentUser?.uid;
            transactions.forEach(t => {
                if (t.payer && t.payer !== 'Me' && t.payer !== '我' && t.payer !== currentUid) t.payer = "友";
                if (t.friendName) t.friendName = "友";
                if (t.beneficiaries) {
                    t.beneficiaries = t.beneficiaries.map(b => (b === 'Me' || b === '我' || b === currentUid) ? b : "友");
                }
            });
            userData.friends = [];
        }

        if (linkConfig.hideProjectNames) {
            if (linkConfig.scope === 'project') {
                userData.projects = userData.projects?.filter(p => p.id === linkConfig.scopeValue).map((p, i) => ({ ...p, name: "專案 " + (i + 1) }));
            } else {
                userData.projects = userData.projects?.map((p, i) => ({ ...p, name: "專案 " + (i + 1) }));
            }
        } else if (linkConfig.scope === 'project') {
            userData.projects = userData.projects?.filter(p => p.id === linkConfig.scopeValue);
        }

        return {
            config: userData.config || {},
            transactions,
            friends: userData.friends || [],
            projects: userData.projects || [],
            paymentMethods: userData.paymentMethods || [],
            categories: userData.categories || [],
            linkConfig: linkConfig
        };
    },

    async clearAccountData() {
        const user = getCurrentUser();
        if (!user) throw new Error("No user logged in");
        await this._deleteCollectionChunked(collection(db, 'users', user.uid, 'transactions'));
    },

    async _deleteCollectionChunked(colRef) {
        const snapshot = await getDocs(colRef);
        if (snapshot.empty) return;
        const docs = snapshot.docs;
        const chunkSize = 450;
        for (let i = 0; i < docs.length; i += chunkSize) {
            const batch = writeBatch(db);
            const chunk = docs.slice(i, i + chunkSize);
            chunk.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        }
    },

    async importData(data, onProgress) {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        const uid = user.uid;
        const userRef = doc(db, 'users', uid);
        let count = 0;
        try {
            const updates = {};
            if (data.categories) updates.categories = data.categories;
            if (data.paymentMethods) updates.paymentMethods = data.paymentMethods;
            if (data.friends) updates.friends = data.friends;
            if (data.projects) updates.projects = data.projects;
            if (data.config) updates.config = data.config;
            if (Object.keys(updates).length > 0) {
                if (onProgress) onProgress("正在更新設定與類別...");
                await setDoc(userRef, updates, { merge: true });
            }
            if (data.transactions && data.transactions.length > 0) {
                if (onProgress) onProgress(`準備匯入 ${data.transactions.length} 筆交易...`);
                const chunkSize = 450;
                for (let i = 0; i < data.transactions.length; i += chunkSize) {
                    const chunk = data.transactions.slice(i, i + chunkSize);
                    const batch = writeBatch(db);
                    if (onProgress) onProgress(`正在寫入批次 ${Math.floor(i / chunkSize) + 1}...`);
                    chunk.forEach(tx => {
                        const txId = tx.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                        const { id, ...txData } = tx;
                        batch.set(doc(db, 'users', uid, 'transactions', txId), txData);
                    });
                    await batch.commit();
                    count += chunk.length;
                }
            }
            return { success: true, count };
        } catch (error) {
            console.error("Import Data Error", error);
            throw error;
        }
    },

    async deleteFullAccount() {
        const user = getCurrentUser();
        if (!user) throw new Error("No user logged in");
        const uid = user.uid;
        for (const colName of ['transactions', 'shared_links']) {
            await this._deleteCollectionChunked(collection(db, 'users', uid, colName));
        }
        await deleteDoc(doc(db, 'users', uid));
        await user.delete();
    },

    async rotateInviteToken() {
        const user = auth.currentUser;
        if (!user) return;
        const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        await updateDoc(doc(db, 'users', user.uid), {
            'config.invite_token': newToken
        });
        return newToken;
    },

    async createShortInvite(params) {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");

        // Generate a 6-character short ID
        const shortId = Math.random().toString(36).substring(2, 8).toUpperCase();
        await setDoc(doc(db, 'short_invites', shortId), {
            params,
            ownerUid: user.uid,
            createdAt: serverTimestamp()
        });
        return shortId;
    },

    async resolveShortCode(shortId) {
        if (!shortId) return null;
        const snap = await getDoc(doc(db, 'short_invites', shortId));
        if (snap.exists()) {
            return snap.data().params;
        }
        return null;
    },

    async processInvite(inviteCode, inviterName, token) {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        if (user.uid === inviteCode) throw new Error("不能邀請自己");

        // 1. Validate Token
        const hostSnap = await getDoc(doc(db, 'users', inviteCode));
        if (!hostSnap.exists()) throw new Error("找不到該用戶");

        const hostConfig = hostSnap.data().config || {};
        if (hostConfig.invite_token !== token) {
            throw new Error("邀請連結已失效，請向好友索取最新連結");
        }

        // 2. Accept Invite (Connect Friends)
        const hostEmail = hostConfig.email || '';
        await this._ensureFriendConnection(inviteCode, inviterName, hostEmail);

        // 3. Rotate Host Token
        // Note: In a production app, this might be a Cloud Function for security.
        // For this project, we execute it from the joiner's side if rules allow.
        try {
            const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await updateDoc(doc(db, 'users', inviteCode), {
                'config.invite_token': newToken
            });
        } catch (e) { console.warn("Token rotation failed (ignore if joining project, as host might have restricted write)", e); }

        return { uid: inviteCode, name: hostConfig.user_name || inviterName || "分享人", email: hostEmail };
    },

    async _ensureFriendConnection(targetUid, targetName, targetEmail = '') {
        const user = auth.currentUser;
        if (!user || !targetUid || user.uid === targetUid) return;

        const myRef = doc(db, 'users', user.uid);
        const mySnap = await getDoc(myRef);
        if (!mySnap.exists()) return;

        let friends = mySnap.data().friends || [];
        const existingIdx = friends.findIndex(f => f.uid === targetUid);

        if (existingIdx === -1) {
            friends.push({
                id: 'f_' + Date.now(),
                uid: targetUid,
                email: targetEmail,
                name: targetName || '新朋友',
                visible: true,
                createdAt: new Date().toISOString()
            });
            await updateDoc(myRef, { friends });
        } else {
            // Restore visibility and update info
            let changed = false;
            if (friends[existingIdx].visible === false) {
                friends[existingIdx].visible = true;
                changed = true;
            }
            if (targetEmail && friends[existingIdx].email !== targetEmail) {
                friends[existingIdx].email = targetEmail;
                changed = true;
            }
            if (targetName && friends[existingIdx].name !== targetName && (!friends[existingIdx].name || friends[existingIdx].name === '分享人' || friends[existingIdx].name === '新朋友' || friends[existingIdx].name === '主機人' || friends[existingIdx].name === '朋友')) {
                friends[existingIdx].name = targetName;
                changed = true;
            }
            if (changed) await updateDoc(myRef, { friends });
        }

        // Send signal for mutual connection
        try {
            await setDoc(doc(db, 'friend_connections', `${targetUid}_${user.uid}`), {
                toUid: targetUid,
                fromUid: user.uid,
                fromName: user.displayName || "好友",
                fromEmail: user.email || '',
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.warn("Signal failed", e);
        }
    },

    async checkPendingConnections() {
        const user = auth.currentUser;
        if (!user) return [];
        try {
            const snap = await getDocs(query(collection(db, 'friend_connections'), where('toUid', '==', user.uid)));
            const connections = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            for (const conn of connections) {
                await this._ensureFriendConnection(conn.fromUid, conn.fromName, conn.fromEmail);
                await this.clearConnection(conn.id);
            }
            return connections;
        } catch (e) { return []; }
    },

    async clearConnection(connId) {
        try { await deleteDoc(doc(db, 'friend_connections', connId)); } catch (e) { }
    },

    // --- COLLABORATION SPECIFIC ---
    async joinProject(hostUid, projectId, token, inviterName) {
        const user = auth.currentUser;
        if (!user) throw new Error("請先登入");
        if (user.uid === hostUid) throw new Error("您已經是計畫擁有者");

        // 1. Validate Token
        const hostSnap = await getDoc(doc(db, 'users', hostUid));
        if (!hostSnap.exists()) throw new Error("找不到該用戶");
        const hostData = hostSnap.data();
        const hostConfig = hostData.config || {};
        if (hostConfig.invite_token !== token) {
            throw new Error("邀請連結已失效，請向好友索取最新連結");
        }

        const projectRef = doc(db, 'users', hostUid, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);
        if (!projectSnap.exists()) throw new Error("找不到該計畫，可能已被刪除");

        const projectData = projectSnap.data();
        if (!projectData.collaborationEnabled) throw new Error("該計畫尚未開啟協作功能");

        // 2. Add me to project collaborators
        await updateDoc(projectRef, {
            collaborators: arrayUnion(user.uid)
        });

        // 3. Ensure Mutual Friend connection between joiner and host
        const hostName = hostConfig.user_name || inviterName || '好友';
        const hostEmail = hostConfig.email || '';
        await this._ensureFriendConnection(hostUid, hostName, hostEmail);

        // 4. Rotate Host Token (if permissions allow, otherwise host will rotate it on next login/refresh)
        try {
            const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            await updateDoc(doc(db, 'users', hostUid), {
                'config.invite_token': newToken
            });
        } catch (e) { console.warn("Token rotation failed (joined successfully but host token must be rotated by host)", e); }

        return { ...projectData, id: projectId, hostId: hostUid };
    },

    async getProjectCollaborators(hostUid, projectId) {
        try {
            const projectSnap = await getDoc(doc(db, 'users', hostUid, 'projects', projectId));
            if (!projectSnap.exists()) return [];
            const uids = projectSnap.data().collaborators || [];
            if (uids.length === 0) return [];

            const collaborators = [];
            for (const uid of uids) {
                try {
                    const uSnap = await getDoc(doc(db, 'users', uid));
                    if (uSnap.exists()) {
                        collaborators.push({
                            uid,
                            name: uSnap.data().config?.user_name || '不具名好友'
                        });
                    }
                } catch (userErr) {
                    console.warn(`[API] Failed to fetch collaborator profile: ${uid}`, userErr);
                    collaborators.push({ uid, name: '參與者' });
                }
            }
            return collaborators;
        } catch (e) {
            console.error("[API] getProjectCollaborators Failed", e);
            throw e;
        }
    },

    async deleteProject(hostId, projectId) {
        const user = auth.currentUser;
        if (!user) throw new Error("Not logged in");
        const targetUid = hostId || user.uid;

        // 1. Delete all transactions associated with this project
        const txSnap = await getDocs(query(collection(db, 'users', targetUid, 'transactions'), where('projectId', '==', projectId)));
        const batch = writeBatch(db);
        txSnap.docs.forEach(doc => batch.delete(doc.ref));

        // 2. Delete the project document
        batch.delete(doc(db, 'users', targetUid, 'projects', projectId));

        await batch.commit();
        return true;
    }
};

window.API = API;
