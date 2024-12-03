import { Injectable } from '@angular/core';
import { Database, getDatabase, ref, get, set, update, onValue, DatabaseReference, object, Query } from '@angular/fire/database';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DatabaseService {

    sessionId: string = 'currentSession';

    rtdb: Database;
    sessionsRef: DatabaseReference;
    currentSessionRef: DatabaseReference;

    constructor(private database: Database) {
      this.rtdb = getDatabase();
      this.sessionsRef = ref(this.rtdb, 'sessions');
      this.currentSessionRef = ref(this.rtdb, 'sessions/currentSession');
    }

    async setData(path: string, object: Object) {
      await set(ref(this.rtdb, path), object);
    };

    async getData(path: string) {
      await get(ref(this.rtdb, path));
    };

    async updateData(path: string, object: Object) {
      await update(ref(this.rtdb, path), object);
    };

    listenData(path: string): Observable<any> {
      const r = ref(this.rtdb, path);
      return object(r)
    }

    async archiveCurrentSession() {
        const archiveKey = Date.now(); // Generate date-time key
        const snapshot = await get(this.currentSessionRef);
        if (snapshot.exists()) {
          const currentSessionData = snapshot.val();
          const archiveRef = ref(this.rtdb, `sessions/${archiveKey}`);
          await set(archiveRef, currentSessionData);
          this.setData('sessions/currentSession', {
            status: "empty"
          })
        }
    };

    async resetSession() {
      await set(this.currentSessionRef, {
          status: 'empty'
      });
    };

    async startSession() {
      await set(this.currentSessionRef, {
          status: 'sessionStarted'
      });
    };

    endSession() {
        update(this.currentSessionRef, {
            status: 'sessionEnded'
        });
    };

    async readCurrentSessionState() {
      let snapshot = await get(this.currentSessionRef);
      let data = snapshot.val();
      if (!data) {
        this.resetSession();
        return null;
      } else {
        return data.status;
      }
      
    };

    async updateCurrentSessionState(state: string) {
      await update(this.currentSessionRef, { status: state });
    }

}