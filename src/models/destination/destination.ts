import { useState } from 'react';
import { message } from 'antd';
import { 
  getDestinations, 
  getDestinationById, 
  createDestination, 
  updateDestination, 
  deleteDestination 
} from '@/services/DiemDen/api';

export default () => {
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formSubmiting, setFormSubmiting] = useState<boolean>(false);
  const [danhSach, setDanhSach] = useState<DiemDen.IDestination[]>([]);
  const [record, setRecord] = useState<DiemDen.IDestination>({} as DiemDen.IDestination);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  const [visible, setVisible] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);

  const getModel = async () => {
    setLoading(true);
    try {
      const response = await getDestinations();
      const data = response?.data || [];
      setDanhSach(data);
      setTotal(data.length);
      return data;
    } catch (err) {
      message.error('Có lỗi xảy ra khi tải dữ liệu');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  const getByIdModel = async (id: string) => {
    setLoading(true);
    try {
      const response = await getDestinationById(id);
      return response?.data;
    } catch (err) {
      message.error('Có lỗi xảy ra khi tải dữ liệu chi tiết');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  const createModel = async (payload: DiemDen.IDestination, callback?: () => void) => {
    setFormSubmiting(true);
    try {
      const response = await createDestination(payload);
      message.success('Thêm mới thành công');
      if (callback) callback();
      return response?.data;
    } catch (err) {
      message.error('Có lỗi xảy ra khi thêm mới');
      return Promise.reject(err);
    } finally {
      setFormSubmiting(false);
    }
  };

  const updateModel = async (id: string, payload: DiemDen.IDestination, callback?: () => void) => {
    setFormSubmiting(true);
    try {
      const response = await updateDestination(id, payload);
      message.success('Cập nhật thành công');
      if (callback) callback();
      return response?.data;
    } catch (err) {
      message.error('Có lỗi xảy ra khi cập nhật');
      return Promise.reject(err);
    } finally {
      setFormSubmiting(false);
    }
  };

  const deleteModel = async (id: string, callback?: () => void) => {
    setLoading(true);
    try {
      await deleteDestination(id);
      message.success('Xóa thành công');
      if (callback) callback();
    } catch (err) {
      message.error('Có lỗi xảy ra khi xóa');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    formSubmiting,
    danhSach,
    setDanhSach,
    record,
    setRecord,
    page,
    setPage,
    limit,
    setLimit,
    total,
    setTotal,
    viewMode,
    setViewMode,
    visible,
    setVisible,
    edit,
    setEdit,
    getModel,
    getByIdModel,
    createModel,
    updateModel,
    deleteModel,
    visibleForm,
    setVisibleForm,
  };
};
