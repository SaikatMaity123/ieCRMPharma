import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

let typingTimeout = null;

const ChatScreen = ({ route, navigation }) => {
  const { receiverId, receiverName } = route.params;

  const [myId, setMyId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const [isReceiverOnline, setIsReceiverOnline] = useState(false);
  const [receiverLastSeen, setReceiverLastSeen] = useState(null);
  const [isReceiverTyping, setIsReceiverTyping] = useState(false);

  /* ---------------- LOAD USER ---------------- */
  useEffect(() => {
    AsyncStorage.getItem('UserData').then(res => {
      if (!res) return;

      const user = JSON.parse(res);
      const empId = user.IDEmployee.toString();

      if (empId === receiverId) {
        Alert.alert('Invalid Chat', 'You cannot chat with yourself.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      setMyId(empId);
    });
  }, []);

  /* ---------------- CONVERSATION ID ---------------- */
  const conversationId = useMemo(() => {
    if (!myId || !receiverId) return null;
    return myId < receiverId
      ? `${myId}_${receiverId}`
      : `${receiverId}_${myId}`;
  }, [myId, receiverId]);

  /* ---------------- MY PRESENCE ---------------- */
  useEffect(() => {
    if (!myId) return;

    const myRef = firestore().collection('users').doc(myId);

    myRef.set({ online: true }, { merge: true });

    return () => {
      myRef.set(
        {
          online: false,
          lastSeen: firestore.FieldValue.serverTimestamp(),
          typingTo: null,
        },
        { merge: true }
      );
    };
  }, [myId]);

  /* ---------------- RECEIVER PRESENCE ---------------- */
  useEffect(() => {
    if (!receiverId || !myId) return;

    const receiverRef = firestore().collection('users').doc(receiverId);

    const unsub = receiverRef.onSnapshot(doc => {
      if (!doc.exists) return;

      const data = doc.data();
      if (!data) return;

      setIsReceiverOnline(data.online === true);
      setReceiverLastSeen(data.lastSeen || null);
      setIsReceiverTyping(data.typingTo === myId);
    });

    return () => unsub();
  }, [receiverId, myId]);

  /* ---------------- MESSAGES LISTENER ---------------- */
  useEffect(() => {
    if (!conversationId) return;

    const unsub = firestore()
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        snapshot => {
          if (!snapshot || snapshot.empty) {
            setMessages([]);
            return;
          }

          const list = snapshot.docs.map(d => ({
            id: d.id,
            ...d.data(),
          }));

          setMessages(list);
        },
        err => {
          console.log('Messages error:', err.message);
          setMessages([]);
        }
      );

    return () => unsub();
  }, [conversationId]);

  /* ---------------- MARK READ ---------------- */
  useEffect(() => {
    if (!conversationId || !myId || messages.length === 0) return;

    const batch = firestore().batch();

    messages.forEach(m => {
      if (m.senderId !== myId && !m.read) {
        const ref = firestore()
          .collection('conversations')
          .doc(conversationId)
          .collection('messages')
          .doc(m.id);

        batch.update(ref, {
          delivered: true,
          read: true,
          readAt: firestore.FieldValue.serverTimestamp(),
        });
      }
    });

    batch.commit();
  }, [messages.length]);

  /* ---------------- TYPING ---------------- */
  const updateTypingStatus = async isTyping => {
    if (!myId) return;

    clearTimeout(typingTimeout);

    const myRef = firestore().collection('users').doc(myId);

    await myRef.set(
      { typingTo: isTyping ? receiverId : null },
      { merge: true }
    );

    if (isTyping) {
      typingTimeout = setTimeout(() => {
        myRef.set({ typingTo: null }, { merge: true });
      }, 1500);
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async () => {
    const msg = text.trim();
    if (!msg || !conversationId) return;

    setText('');

    // clear typing
    await firestore()
      .collection('users')
      .doc(myId)
      .set({ typingTo: null }, { merge: true });

    const convoRef = firestore()
      .collection('conversations')
      .doc(conversationId);

    await firestore().runTransaction(async tx => {
      tx.set(
        convoRef,
        {
          participants: [myId, receiverId],
          lastMessage: msg,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      tx.set(convoRef.collection('messages').doc(), {
        senderId: myId,
        text: msg,
        createdAt: firestore.FieldValue.serverTimestamp(),
        delivered: false,
        read: false,
      });
    });
  };

  /* ---------------- MESSAGE UI ---------------- */
  const renderItem = ({ item }) => {
    const isMine = item.senderId === myId;

    let icon = 'checkmark';
    let color = 'rgba(255,255,255,0.7)';

    if (item.delivered) icon = 'checkmark-done';
    if (item.read) color = '#4fc3f7';

    return (
      <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
        <Text style={{ color: isMine ? '#fff' : '#000' }}>{item.text}</Text>

        {isMine && (
          <View style={styles.tickRow}>
            <Ionicons name={icon} size={16} color={color} />
          </View>
        )}
      </View>
    );
  };

  /* ---------------- UI ---------------- */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'android' ? 75 : 0}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarFallback}>
              <MaterialIcons name="person" size={24} color="#fff" />
            </View>
            {isReceiverOnline && <View style={styles.onlineDot} />}
          </View>

          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerText}>{receiverName}</Text>
            <Text style={styles.subText}>
              {isReceiverTyping
                ? 'typing...'
                : isReceiverOnline
                ? 'online'
                : receiverLastSeen
                ? `last seen ${new Date(
                    receiverLastSeen.seconds * 1000
                  ).toLocaleString()}`
                : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* CHAT */}
      <FlatList
        inverted
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 14 }}
      />

      {/* INPUT */}
      <SafeAreaView edges={['bottom']} style={styles.inputBar}>
        <TextInput
          value={text}
          onChangeText={t => {
            setText(t);
            updateTypingStatus(!!t);
          }}
          placeholder="Type a message"
          style={styles.input}
          multiline
        />

        <TouchableOpacity
          onPress={sendMessage}
          disabled={!text.trim()}
          style={[
            styles.sendCircle,
            { opacity: text.trim() ? 1 : 0.5 },
          ]}
        >
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  header: {
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
  bubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 6,
    maxWidth: '78%',
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
  },
  tickRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee', 
    backgroundColor: '#fff',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 120,
  },
  sendCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0a4fe4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});
