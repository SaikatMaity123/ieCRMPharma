import auth from '@react-native-firebase/auth';

/**
 * Ensures Firebase Auth session for chat.
 * Safe for internal enterprise apps.
 */
export const firebaseChatLogin = async (employeeId) => {
  const email = `emp_${employeeId}@crmchat.local`;
  const password = 'Emp@12345';

  try {
    // If already logged in → OK
    if (auth().currentUser) {
      return true;
    }

    // Try sign-in first
    await auth().signInWithEmailAndPassword(email, password);
    return true;
  } catch (err) {
    console.log('Chat auth sign-in failed, trying create:', err.code);

    try {
      // Always try to create user if sign-in fails
      await auth().createUserWithEmailAndPassword(email, password);
      return true;
    } catch (createErr) {
      // If already exists → sign in again
      if (createErr.code === 'auth/email-already-in-use') {
        await auth().signInWithEmailAndPassword(email, password);
        return true;
      }

      // Anything else → real error
      console.error('Firebase chat login error:', createErr);
      throw createErr;
    }
  }
};
