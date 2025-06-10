import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export const useUserStore = defineStore("user", () => {
  // State
  const user = ref(null);
  const isGuest = ref(false);
  const isLoading = ref(true);
  const error = ref(null);
  const currentProfile = ref(null);
  const profiles = ref([]);
  const profilesLoaded = ref(false);
  const myLists = ref({});
  const ratings = ref(
    JSON.parse(localStorage.getItem("netflix-ratings")) || {}
  );

  const isLoggedIn = computed(() => !!user.value);

  const currentMyList = computed(() => {
    if (!currentProfile.value) return [];
    return myLists.value[currentProfile.value.id] || [];
  });

  const isItemInMyList = (item, contentType) => {
    if (!currentMyList.value || !item) return false;
    return currentMyList.value.some(
      (listItem) =>
        Number(listItem.id) === Number(item.id) &&
        listItem.media_type === contentType
    );
  };

  async function toggleListItem(item, contentType) {
    if (!user.value || !currentProfile.value) {
      throw new Error("No user or profile selected.");
    }

    const alreadyInList = isItemInMyList(item, contentType);

    if (alreadyInList) {
      const listItem = currentMyList.value.find(
        (i) => Number(i.id) === Number(item.id) && i.media_type === contentType
      );
      if (!listItem?.docId) {
        console.error(
          "Cannot remove: List item is missing its Firestore docId.",
          listItem
        );
        throw new Error("Could not find item in list to remove.");
      }
      await removeFromMyList(listItem.docId);
      console.log("Removed from My List:", item.title || item.name);
    } else {
      const itemToAdd = {
        id: item.id,
        title: item.title || null,
        name: item.name || null,
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        media_type: contentType,
        overview: item.overview,
        vote_average: item.vote_average,
        release_date: item.release_date || item.first_air_date || null,
        genre_ids: item.genre_ids || [],
      };
      await addToMyList(itemToAdd);
      console.log("Added to My List:", item.title || item.name);
    }
  }

  function clearError() {
    error.value = null;
  }

  async function init() {
    return new Promise((resolve) => {
      isLoading.value = true;
      onAuthStateChanged(auth, async (authUser) => {
        if (authUser) {
          isGuest.value = authUser.isAnonymous;
          user.value = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName || "User",
            photoURL: authUser.photoURL,
          };
          await loadProfiles();
        } else {
          user.value = null;
          isGuest.value = false;
          currentProfile.value = null;
          profiles.value = [];
          myLists.value = {};
        }
        isLoading.value = false;
        resolve();
      });
    });
  }

  async function signUp({ email, password, displayName }) {
    clearError();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const authUser = userCredential.user;
      if (displayName) {
        await updateProfile(authUser, { displayName });
      }
      await setDoc(doc(db, "users", authUser.uid), {
        displayName: displayName || email.split("@")[0],
        email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: "user",
      });
      return authUser;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function signIn({ email, password, rememberMe = true }) {
    clearError();
    try {
      const persistenceType = rememberMe
        ? browserLocalPersistence
        : browserSessionPersistence;
      await setPersistence(auth, persistenceType);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userRef = doc(db, "users", userCredential.user.uid);
      await updateDoc(userRef, { lastLogin: serverTimestamp() });
      return userCredential.user;
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  const defaultGuestProfiles = [
    {
      name: "Guest",
      avatar: "/avatars/classic/Classic3.png",
      settings: { autoplay: true, maturityLevel: "all" },
    },
    {
      name: "Family",
      avatar: "/avatars/classic/Classic1.png",
      settings: { autoplay: true, maturityLevel: "all" },
    },
  ];

  const availableAvatars = [
    "/avatars/classic/Classic1.png",
    "/avatars/classic/Classic2.png",
    "/avatars/classic/Classic3.png",
    "/avatars/classic/Classic4.png",
  ];

  function sanitizeAvatarUrl(avatarUrl) {
    if (!avatarUrl || avatarUrl.includes("pravatar.cc")) {
      const randomIndex = Math.floor(Math.random() * availableAvatars.length);
      return availableAvatars[randomIndex];
    }
    return avatarUrl;
  }

  async function loadProfiles() {
    profilesLoaded.value = false;
    if (!user.value) {
      profiles.value = [];
      currentProfile.value = null;
      localStorage.removeItem("netflix_clone_active_profile_id");
      profilesLoaded.value = true;
      return;
    }
    try {
      const profilesRef = collection(db, "users", user.value.uid, "profiles");
      const profilesSnapshot = await getDocs(profilesRef);
      const loadedProfiles = [];
      profilesSnapshot.forEach((doc) => {
        const profileData = doc.data();
        loadedProfiles.push({
          id: doc.id,
          ...profileData,
          avatar: sanitizeAvatarUrl(profileData.avatar),
        });
      });

      if (loadedProfiles.length === 0) {
        const defaultsToCreate = isGuest.value
          ? defaultGuestProfiles
          : [
              {
                name: user.value.displayName || "User",
                avatar: "/avatars/classic/Classic1.png",
                settings: { autoplay: true, maturityLevel: "all" },
              },
            ];
        for (const profile of defaultsToCreate) {
          const docRef = await addDoc(
            collection(db, "users", user.value.uid, "profiles"),
            { ...profile, createdAt: serverTimestamp() }
          );
          loadedProfiles.push({ id: docRef.id, ...profile });
        }
      }
      profiles.value = loadedProfiles;

      const activeProfileId = localStorage.getItem(
        "netflix_clone_active_profile_id"
      );
      let profileToSet = null;

      if (profiles.value.length > 0) {
        if (activeProfileId) {
          profileToSet = profiles.value.find((p) => p.id === activeProfileId);
        }
        if (!profileToSet) {
          profileToSet = profiles.value[0];
        }
      }

      if (profileToSet) {
        await setActiveProfile(profileToSet);
      } else {
        currentProfile.value = null;
        localStorage.removeItem("netflix_clone_active_profile_id");
        console.warn(
          "No profiles found or no active profile could be determined. currentProfile set to null."
        );
      }
    } catch (err) {
      console.error("Error loading profiles:", err);
      profiles.value = [];
      currentProfile.value = null;
      localStorage.removeItem("netflix_clone_active_profile_id");
    } finally {
      profilesLoaded.value = true;
    }
  }

  async function signInAsGuest() {
    clearError();
    try {
      const userCredential = await signInAnonymously(auth);
      const authUser = userCredential.user;
      isGuest.value = true;
      const userRef = doc(db, "users", authUser.uid);
      await setDoc(
        userRef,
        {
          isGuest: true,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
      return authUser;
    } catch (err) {
      error.value = err.message || "Failed to sign in as guest";
      throw err;
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (err) {
      error.value = err.message;
      throw err;
    }
  }

  async function addProfile(profile) {
    if (!user.value) return;
    try {
      const docRef = await addDoc(
        collection(db, "users", user.value.uid, "profiles"),
        profile
      );
      profiles.value.push({ id: docRef.id, ...profile });
      return docRef.id;
    } catch (err) {
      console.error("Error adding profile:", err);
      throw err;
    }
  }

  async function updateProfileData(profileId, updatedData) {
    if (!user.value) return;
    try {
      const profileRef = doc(
        db,
        "users",
        user.value.uid,
        "profiles",
        profileId
      );
      await updateDoc(profileRef, updatedData);
      const index = profiles.value.findIndex((p) => p.id === profileId);
      if (index !== -1) {
        profiles.value[index] = { ...profiles.value[index], ...updatedData };
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      throw err;
    }
  }

  async function deleteProfile(profileId) {
    if (!user.value) return;
    try {
      const profileRef = doc(
        db,
        "users",
        user.value.uid,
        "profiles",
        profileId
      );
      await deleteDoc(profileRef);
      profiles.value = profiles.value.filter((p) => p.id !== profileId);
    } catch (err) {
      console.error("Error deleting profile:", err);
      throw err;
    }
  }

  async function setActiveProfile(profile) {
    if (!profile || !profile.id) {
      console.error(
        "Attempted to set an invalid or undefined profile. Profile data:",
        profile
      );
      currentProfile.value = null;
      localStorage.removeItem("netflix_clone_active_profile_id");
      return false;
    }
    try {
      currentProfile.value = profile;
      localStorage.setItem("netflix_clone_active_profile_id", profile.id);
      await loadProfileData(profile.id);
      return true;
    } catch (error) {
      console.error("Error setting active profile:", error);
      currentProfile.value = null;
      localStorage.removeItem("netflix_clone_active_profile_id");
      return false;
    }
  }

  async function loadProfileData(profileId) {
    if (!user.value) return;
    try {
      const myListRef = collection(
        db,
        "users",
        user.value.uid,
        "profiles",
        profileId,
        "myList"
      );
      const myListSnapshot = await getDocs(myListRef);
      const items = [];
      myListSnapshot.forEach((doc) => {
        items.push({ docId: doc.id, ...doc.data() });
      });
      myLists.value[profileId] = items;
    } catch (err) {
      console.error("Error loading profile data:", err);
      myLists.value[profileId] = [];
    }
  }

  async function addToMyList(item) {
    if (!user.value || !currentProfile.value) return;
    try {
      const myListRef = collection(
        db,
        "users",
        user.value.uid,
        "profiles",
        currentProfile.value.id,
        "myList"
      );
      const dataToSave = { ...item, addedAt: serverTimestamp() };
      const docRef = await addDoc(myListRef, dataToSave);
      if (!myLists.value[currentProfile.value.id]) {
        myLists.value[currentProfile.value.id] = [];
      }
      myLists.value[currentProfile.value.id].push({
        docId: docRef.id,
        ...item,
        addedAt: new Date(),
      });
      return docRef.id;
    } catch (err) {
      console.error("Error adding to My List:", err);
      throw err;
    }
  }

  async function removeFromMyList(firestoreDocId) {
    if (!user.value || !currentProfile.value) return;
    if (typeof firestoreDocId !== "string" || firestoreDocId.trim() === "") {
      const errMsg = "Invalid Firestore document ID provided for removal.";
      console.error(errMsg, firestoreDocId);
      throw new Error(errMsg);
    }
    try {
      const itemRef = doc(
        db,
        "users",
        user.value.uid,
        "profiles",
        currentProfile.value.id,
        "myList",
        firestoreDocId
      );
      await deleteDoc(itemRef);
      if (myLists.value[currentProfile.value.id]) {
        myLists.value[currentProfile.value.id] = myLists.value[
          currentProfile.value.id
        ].filter((item) => item.docId !== firestoreDocId);
      }
    } catch (err) {
      console.error("Error removing from My List:", err);
      throw err;
    }
  }
  function setRating(contentId, rating) {
    if (rating === null) {
      delete ratings.value[contentId];
    } else {
      ratings.value[contentId] = rating;
    }
    localStorage.setItem("netflix-ratings", JSON.stringify(ratings.value));
  }

  return {
    user,
    isGuest,
    isLoading,
    error,
    profiles,
    currentProfile,

    isLoggedIn,
    currentMyList,

    isItemInMyList,

    init,
    signUp,
    signIn,
    signInAsGuest,
    logout,
    clearError,
    loadProfiles,
    addProfile,
    updateProfileData,
    deleteProfile,
    setActiveProfile,
    addToMyList,
    removeFromMyList,

    toggleListItem,
    availableAvatars,

    ratings,
    setRating,
    profilesLoaded, // Expose the new flag
  };
});
