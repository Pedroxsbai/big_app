import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDatabase } from '../services/DatabaseContext';

const UserProfileScreen = ({ navigation }) => {
  const { currentUser, createUser, updateUser, clearUserData, exportUserData, loading } = useDatabase();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        location: currentUser.location || ''
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        Alert.alert('خطأ', 'الاسم مطلوب');
        return;
      }

      if (currentUser) {
        // تحديث المستخدم الموجود
        const success = await updateUser(formData);
        if (success) {
          Alert.alert('نجح', 'تم تحديث البيانات بنجاح');
          setIsEditing(false);
        } else {
          Alert.alert('خطأ', 'فشل في تحديث البيانات');
        }
      } else {
        // إنشاء مستخدم جديد
        const userId = await createUser(formData);
        if (userId) {
          Alert.alert('نجح', 'تم إنشاء الملف الشخصي بنجاح');
          setIsEditing(false);
        } else {
          Alert.alert('خطأ', 'فشل في إنشاء الملف الشخصي');
        }
      }
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      Alert.alert('خطأ', 'حدث خطأ في حفظ البيانات');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const success = await clearUserData();
      if (success) {
        Alert.alert('نجح', 'تم حذف الحساب بنجاح');
        setShowDeleteModal(false);
        navigation.goBack();
      } else {
        Alert.alert('خطأ', 'فشل في حذف الحساب');
      }
    } catch (error) {
      console.error('خطأ في حذف الحساب:', error);
      Alert.alert('خطأ', 'حدث خطأ في حذف الحساب');
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportUserData();
      if (data) {
        // هنا يمكنك إضافة منطق تصدير البيانات
        Alert.alert('نجح', 'تم تصدير البيانات بنجاح');
        console.log('Exported data:', data);
      } else {
        Alert.alert('خطأ', 'فشل في تصدير البيانات');
      }
    } catch (error) {
      console.error('خطأ في تصدير البيانات:', error);
      Alert.alert('خطأ', 'حدث خطأ في تصدير البيانات');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#166534" />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-right" size={24} color="#166534" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الملف الشخصي</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}
        >
          <MaterialCommunityIcons 
            name={isEditing ? "close" : "pencil"} 
            size={24} 
            color="#166534" 
          />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-circle" size={80} color="#166534" />
        </View>
        
        {isEditing ? (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>الاسم *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({...formData, name: text})}
                placeholder="أدخل اسمك"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                placeholder="أدخل بريدك الإلكتروني"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>رقم الهاتف</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData({...formData, phone: text})}
                placeholder="أدخل رقم هاتفك"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>الموقع</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => setFormData({...formData, location: text})}
                placeholder="أدخل موقعك"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <Text style={styles.nameText}>{currentUser?.name || 'لم يتم تحديد الاسم'}</Text>
            <Text style={styles.infoText}>{currentUser?.email || 'لم يتم تحديد البريد الإلكتروني'}</Text>
            <Text style={styles.infoText}>{currentUser?.phone || 'لم يتم تحديد رقم الهاتف'}</Text>
            <Text style={styles.infoText}>{currentUser?.location || 'لم يتم تحديد الموقع'}</Text>
            <Text style={styles.joinDateText}>
              انضم في: {currentUser ? new Date(currentUser.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
          <MaterialCommunityIcons name="download" size={24} color="#166534" />
          <Text style={styles.actionButtonText}>تصدير البيانات</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => setShowDeleteModal(true)}
        >
          <MaterialCommunityIcons name="delete" size={24} color="#DC2626" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>حذف الحساب</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تأكيد الحذف</Text>
            <Text style={styles.modalMessage}>
              هل أنت متأكد من حذف حسابك؟ سيتم حذف جميع البيانات المرتبطة بحسابك ولا يمكن استردادها.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.confirmButtonText}>حذف</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#166534',
    fontFamily: 'Cairo-Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FEF9EF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1E7C6',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
    fontFamily: 'Cairo-Bold',
  },
  editButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: '#FEF9EF',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1E7C6',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
    fontFamily: 'Cairo-Bold',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#166534',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontFamily: 'Cairo-Regular',
  },
  saveButton: {
    backgroundColor: '#166534',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Cairo-Bold',
  },
  infoContainer: {
    alignItems: 'center',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 8,
    fontFamily: 'Cairo-Bold',
  },
  infoText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Cairo-Regular',
  },
  joinDateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    fontFamily: 'Cairo-Regular',
  },
  actionsContainer: {
    padding: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9EF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1E7C6',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#166534',
    marginLeft: 12,
    fontFamily: 'Cairo-Regular',
  },
  deleteButton: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'Cairo-Bold',
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Cairo-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  confirmButton: {
    backgroundColor: '#DC2626',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Cairo-Bold',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Cairo-Bold',
  },
});

export default UserProfileScreen;
