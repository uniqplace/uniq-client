import { useState, useRef, useEffect, useMemo } from "react";
import { Bot, User, Lock } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../../hooks/hooks";
import type { RootState } from "../../../store";
import type { ProductParam } from "../slices/aiProductTypes";
import {
  addParam,
  updateParam,
  skipParam,
} from "../slices/aiProductSlice";
import {
  generateDraft,
  refineSpec,
  // validateSpec,
  lockSpec,
} from "../slices/aiProductThunks";
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { useGetAllCategoriesQuery, useGetSubCategoriesByCategoryQuery } from '../../marketplace/slices/categoriesApiSlice';
import type { Category, SubCategory } from '../../../types';
import { useGetSimilarProductsQuery } from "../../marketplace/slices/productApiSlice";
import SimilarProductsCarousel from "./SimilarProductsCarousel";
import { ProgressSpinner } from "primereact/progressspinner";

export default function AiProductDebugPanel() {
  const dispatch = useAppDispatch();
  const aiProduct = useAppSelector((state: RootState) => state.aiProduct);
  const user = useAppSelector((state: RootState) => state.user);

  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >(() => {
    try {
      const data = localStorage.getItem("aiProductChat");
      if (data) return JSON.parse(data);
    } catch (e) { }
    return [];
  });

  // Reset chat/messages when user changes (logout/login)
  useEffect(() => {
    setMessages([]);
    localStorage.removeItem("aiProductChat");
  }, [user?.id]);

  const [newParam, setNewParam] = useState<{
    label: string;
    type: ProductParam["type"];
    requiredByAI: boolean;
  }>({ label: "", type: "text", requiredByAI: false });

  const [userText, setUserText] = useState("");
  const [showAddParamRow, setShowAddParamRow] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  // const [pendingLockData, setPendingLockData] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const paramsTableRef = useRef<HTMLDivElement>(null);
  const addParamRowRef = useRef<HTMLInputElement>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const toast = useRef<Toast>(null);
  const [embedding, setEmbedding] = useState<number[]>([]);
  const { data: products = [], isLoading } = useGetSimilarProductsQuery(
    embedding, 
    {
      skip: !embedding || embedding.length === 0,
    }
  );

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  function saveChat(messages: { sender: "user" | "ai"; text: string }[]) {
    try {
      localStorage.setItem("aiProductChat", JSON.stringify(messages));
    } catch (e) { }
  }

  const handleSend = () => {
    if (!userText.trim()) return;
    setMessages((msgs) => {
      const newMsgs = [...msgs, { sender: "user" as const, text: userText }];
      saveChat(newMsgs);
      return newMsgs;
    });
    if (messages.length === 0) {
      dispatch(generateDraft({ userText })).then((res: any) => {
        if (res?.payload) {
          if (res.payload.embedding) {
            setEmbedding(res.payload.embedding);  
          }    
          const aiMsg = res.payload.chat || res.payload.aiResponse;
          if (aiMsg) {
            setMessages((msgs) => {
              const newMsgs = [...msgs, { sender: "ai" as const, text: aiMsg }];
              saveChat(newMsgs);
              return newMsgs;
            });
          }
        }
      });
    } else {
      dispatch(refineSpec({ userInstruction: userText, params: aiProduct.params })).then((res: any) => {
        if (res?.payload) {
             if (res.payload.embedding) {
            setEmbedding(res.payload.embedding);  
          } 
          const aiMsg = res.payload.chat || res.payload.aiResponse;
          if (aiMsg) {
            setMessages((msgs) => {
              const newMsgs = [...msgs, { sender: "ai" as const, text: aiMsg }];
              saveChat(newMsgs);
              return newMsgs;
            });
          }
        }
      });
    }
    setUserText("");
    setTimeout(scrollToBottom, 100);
  };

  // enums for selects
  const statusOptions = ["draft", "published", "hidden"];
  const conditionOptions = ["new", "like_new", "good", "fair", "poor"];

  // Fetch categories from API
  const { data: categoriesResponse, isLoading: loadingCategories, error: categoriesError } = useGetAllCategoriesQuery();
  const categories: Category[] = categoriesResponse?.data || [];

  // Fetch subCategories from API based on selected category
  const selectedCategoryId = editProduct?.category || '';
  const { data: subCategoriesResponse, isLoading: loadingSubCategories, error: subCategoriesError } = useGetSubCategoriesByCategoryQuery(selectedCategoryId, { skip: !selectedCategoryId });
  const subCategories: SubCategory[] = subCategoriesResponse || [];

  // Validation for required fields
  const requiredFields = [
    { key: 'title', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'price', label: 'Price' },
    { key: 'tags', label: 'Tags' },
    { key: 'images', label: 'Image' },
    { key: 'status', label: 'Status' },
    { key: 'condition', label: 'Condition' },
    { key: 'location', label: 'Location' },
    { key: 'category', label: 'Category' },
    { key: 'subCategories', label: 'SubCategories' },
  ];
  const missingFields = requiredFields.filter(f => {
    const val = editProduct?.[f.key];
    if (Array.isArray(val)) return val.length === 0;
    return !val;
  });
  const isSaveDisabled = missingFields.length > 0;

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
      {/* Chat Section */}
      <div className="flex flex-col h-[600px] border rounded-2xl bg-white shadow-sm">
        <div className="p-4 border-b font-semibold text-lg">AI product creation</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-gray-400 text-center mt-20 text-lg font-medium">
              Start the conversation...
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
            >
              {msg.sender === "ai" && (
                <div className="bg-purple-500 text-white rounded-full p-2">
                  <Bot size={18} />
                </div>
              )}
              <div
                className={`px-3 py-2 rounded-2xl max-w-[80%] ${msg.sender === "user"
                  ? "bg-blue-100 text-gray-800"
                  : "bg-purple-100 text-gray-800"
                  }`}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && (
                <div className="bg-blue-500 text-white rounded-full p-2">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring focus:ring-blue-200"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 flex items-center justify-center"
            aria-label="Send"
          >
            <span className="pi pi-send text-lg"></span>
          </button>
        </div>
      </div>

      {/* Parameters Section */}
      <div className="flex flex-col h-[600px] border rounded-2xl bg-white shadow-sm">
        <div className="p-4 border-b font-semibold text-lg">Product parameters</div>
        <div className="flex flex-col" style={{ minHeight: 0, height: 'auto', flex: 'unset' }}>
          <div className="overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e0e7ef #fff', maxHeight: 320 }} ref={paramsTableRef}>
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 font-medium text-center">Label</th>
                  <th className="p-2 font-medium text-center">Value</th>
                  <th className="p-2 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {aiProduct.params.map((param) => {
                  const isSkipped = param.status === "skipped";
                  const isRequiredAndEmpty = param.requiredByAI && (param.value === undefined || param.value === null || param.value === "");
                  return (
                    <tr key={param.id} className={`border-b ${isSkipped ? 'bg-red-50 opacity-70' : 'bg-white'}`}>
                      <td className={`p-2 font-semibold text-center ${isSkipped ? 'line-through text-red-600' : 'text-indigo-700'}`}>{param.label}
                        {param.source === "user" && (
                          <div className="text-xs text-gray-400 mt-1">+ Added by user</div>
                        )}
                      </td>
                      <td className="p-2 text-gray-800 text-center">
                        {isRequiredAndEmpty ? (
                          <span className="text-red-500 font-bold">Required</span>
                        ) : (
                          typeof param.value === 'object' && param.value !== null
                            ? Array.isArray(param.value)
                              ? param.value.join(', ')
                              : Object.entries(param.value).map(([k, v]) => `${k}: ${v}`).join(', ')
                            : param.value?.toString() || <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-2 flex gap-2 items-center justify-center">
                        <button
                          className="px-2 py-1 text-sm rounded-md bg-indigo-100 hover:bg-indigo-200 transition disabled:opacity-50"
                          onClick={() => {
                            const value = prompt('New value:', param.value ?? '');
                            if (value !== null)
                              dispatch(updateParam({ id: param.id, value }));
                          }}
                          disabled={isSkipped}
                        >
                          ✏️
                        </button>
                        {param.requiredByAI && (
                          param.status === "skipped" ? (
                            <button
                              className="px-2 py-1 text-sm rounded-md bg-green-100 hover:bg-green-200 transition"
                              onClick={() => dispatch(updateParam({ id: param.id, value: param.value ?? '' }))}
                            >
                              🔄 Unskip
                            </button>
                          ) : (
                            <button
                              className="px-2 py-1 text-sm rounded-md bg-red-100 hover:bg-red-200 transition"
                              onClick={() => dispatch(skipParam({ id: param.id }))}
                            >
                              ⏭️ Skip
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
                {showAddParamRow && (
                  <tr>
                    <td className="p-1 text-center">
                      <input
                        ref={addParamRowRef}
                        placeholder="Label"
                        value={newParam.label}
                        onChange={e => setNewParam(p => ({ ...p, label: e.target.value }))}
                        className="w-full px-1 py-1 rounded-lg border border-indigo-200 focus:ring focus:ring-indigo-200 text-sm bg-slate-50"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <select
                        value={newParam.type}
                        onChange={e => setNewParam(p => ({ ...p, type: e.target.value as ProductParam['type'] }))}
                        className="w-full px-1 py-1 rounded-lg border border-indigo-200 focus:ring focus:ring-indigo-200 text-sm bg-slate-50"
                      >
                        <option value="text">text</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="color">color</option>
                        <option value="enum">enum</option>
                        <option value="file">file</option>
                        <option value="date">date</option>
                      </select>
                    </td>
                    <td className="p-1 flex gap-2 items-center justify-center">
                      <label className="flex items-center gap-1 text-sm text-indigo-600">
                        <input
                          type="checkbox"
                          checked={newParam.requiredByAI}
                          onChange={e => setNewParam(p => ({ ...p, requiredByAI: e.target.checked }))}
                        />
                        Required
                      </label>
                      <button
                        className="px-2 py-1 text-sm rounded-md bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => {
                          if (!newParam.label.trim()) return;
                          dispatch(
                            addParam({
                              id: crypto.randomUUID(),
                              label: newParam.label,
                              type: newParam.type,
                              requiredByAI: newParam.requiredByAI,
                              status: "missing",
                              source: "user",
                            })
                          );
                          setNewParam({ label: "", type: "text", requiredByAI: false });
                          setShowAddParamRow(false);
                        }}
                      >
                        Save
                      </button>
                      <button
                        className="px-2 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
                        onClick={() => setShowAddParamRow(false)}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-indigo-100 bg-white flex justify-end px-1 py-1" style={{ position: 'static', marginTop: 0, flexShrink: 0, minHeight: 0, height: 'auto' }}>
            <button
              className="py-1 px-3 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-500 to-sky-400 shadow hover:opacity-90 text-sm"
              onClick={() => {
                setShowAddParamRow(true);
                setTimeout(() => {
                  if (paramsTableRef.current) {
                    paramsTableRef.current.scrollTop = paramsTableRef.current.scrollHeight;
                  }
                  if (addParamRowRef.current) {
                    addParamRowRef.current.focus();
                  }
                }, 100);
              }}
              disabled={showAddParamRow}
            >
              ➕ Add Param
            </button>
          </div>
        </div>

        <div className="p-4 border-t flex gap-2">
          <button
            className={`rounded-lg px-4 py-2 flex items-center gap-2 font-semibold transition-colors 
      ${aiProduct.params.length === 0
                ? 'bg-green-200 text-white opacity-60 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'}`}
            disabled={aiProduct.params.length === 0}
            onClick={() => {
              if (aiProduct.params.length === 0) return;
              setEditProduct({
                title: aiProduct.title || "AI Generated Product",
                description: aiProduct.description || "This product was created using AI assistance.",
                price: aiProduct.price,
                images: aiProduct.images || [],
                creator: user.id,
                category: aiProduct.category,
                subCategories: aiProduct.subCategories,
                status: aiProduct.status,
                condition: aiProduct.condition || 'new',
                location: aiProduct.location || "",
                tags: aiProduct.tags || [],
                params: aiProduct.params,
                createdByAI: aiProduct.createdByAI || true,
                aiVersion: aiProduct.aiVersion,
              });
              setShowConfirmDialog(true);
            }}
          >
            <Lock size={16} /> Yes! I'm sure about my product
          </button>
        </div>
        <Dialog
          header="Edit Product"
          visible={showConfirmDialog}
          style={{ width: '600px', maxWidth: '90vw' }}
          onHide={() => setShowConfirmDialog(false)}
          footer={
            <div className="flex gap-2 justify-end mt-4">
              <button
                className="bg-gray-200 hover:bg-gray-300 rounded px-4 py-2 font-medium"
                onClick={() => setShowConfirmDialog(false)}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 font-medium disabled:opacity-50"
                disabled={isSaveDisabled}
                onClick={async () => {
                  setShowConfirmDialog(false);
                  try {
                    const lockRes = await dispatch(
                      lockSpec({ productData: editProduct })
                    );
                    if (lockRes?.payload?.success) {
                      toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Your product has been saved and locked successfully!', life: 4000 });
                    } else {
                      toast.current?.show({ severity: 'error', summary: 'Error', detail: lockRes?.payload?.error || 'Failed to lock the product.', life: 4000 });
                    }
                  } catch (e) {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'An unexpected error occurred.', life: 4000 });
                  }
                }}
              >
                Save
              </button>
            </div>
          }
        >
          {editProduct && (
            <div className="space-y-4 px-2 py-2">
              {/* Name */}
              <div>
                <label className="font-semibold block mb-1">Name</label>
                <input
                  className={`w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200 ${!editProduct.title ? 'border-red-400' : ''}`}
                  value={editProduct.title}
                  onChange={e => setEditProduct((p: any) => ({ ...p, title: e.target.value }))}
                  placeholder="Product name"
                />
                {!editProduct.title && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
              {/* Description */}
              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  className={`w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200 ${!editProduct.description ? 'border-red-400' : ''}`}
                  value={editProduct.description}
                  onChange={e => setEditProduct((p: any) => ({ ...p, description: e.target.value }))}
                  placeholder="Product description"
                  rows={3}
                />
                {!editProduct.description && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
              {/* Price */}
              <div>
                <label className="font-semibold block mb-1">Price</label>
                <input
                  type="number"
                  className={`w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200 ${!editProduct.price ? 'border-red-400' : ''}`}
                  value={editProduct.price}
                  onChange={e => setEditProduct((p: any) => ({ ...p, price: e.target.value }))}
                  placeholder="Price"
                />
                {!editProduct.price && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
              {/* Tags */}
              <div>
                <label className="font-semibold block mb-1">Tags</label>
                <input
                  className={`w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200 ${!editProduct.tags?.length ? 'border-red-400' : ''}`}
                  value={Array.isArray(editProduct.tags) ? editProduct.tags.join(', ') : ''}
                  onChange={e => setEditProduct((p: any) => ({ ...p, tags: e.target.value.split(',').map((s: string) => s.trim()) }))}
                  placeholder="tag1, tag2, ..."
                />
                {(!editProduct.tags || !editProduct.tags.length) && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
              {/* Image */}
              <div>
                <label className="font-semibold block mb-1">Image</label>
                <input
                  className={`w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200 ${!editProduct.images?.length ? 'border-red-400' : ''}`}
                  value={Array.isArray(editProduct.images) && editProduct.images.length > 0 ? editProduct.images[0] : ''}
                  onChange={e => setEditProduct((p: any) => ({ ...p, images: [e.target.value] }))}
                  placeholder="Image URL"
                />
                {Array.isArray(editProduct.images) && editProduct.images[0] && (
                  <img src={editProduct.images[0]} alt="product" className="mt-2 max-h-32 rounded shadow border" />
                )}
                {(!editProduct.images || !editProduct.images.length) && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
              {/* Category */}
              <div>
                <label className="font-semibold block mb-1">Category</label>
                <select
                  className={`w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200 ${!editProduct.category ? 'border-red-400' : ''}`}
                  value={editProduct.category || ''}
                  onChange={e => setEditProduct((p: any) => ({ ...p, category: e.target.value, subCategories: [] }))}
                >
                  <option value="">Select category</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                {!editProduct.category && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
              {/* SubCategories */}
              <div>
                <label className="font-semibold block mb-1">SubCategories</label>
                <select
                  className={`w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200 ${!editProduct.subCategories?.length ? 'border-red-400' : ''}`}
                  value={editProduct.subCategories[0] || ''}
                  onChange={e => setEditProduct((p: any) => ({ ...p, subCategories: [e.target.value] }))}
                  disabled={!editProduct.category}
                >
                  <option value="">Select subcategory</option>
                  {subCategories.map((sub: any) => (
                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                  ))}
                </select>
                {(!editProduct.subCategories || !editProduct.subCategories.length) && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
              {/* Status */}
              <div>
                <label className="font-semibold block mb-1">Status</label>
                <select
                  className={`w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200 ${!editProduct.status ? 'border-red-400' : ''}`}
                  value={editProduct.status || ''}
                  onChange={e => setEditProduct((p: any) => ({ ...p, status: e.target.value }))}
                >
                  <option value="">Select status</option>
                  {statusOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {!editProduct.status && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
              {/* Condition */}
              <div>
                <label className="font-semibold block mb-1">Condition</label>
                <select
                  className={`w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200 ${!editProduct.condition ? 'border-red-400' : ''}`}
                  value={editProduct.condition || ''}
                  onChange={e => setEditProduct((p: any) => ({ ...p, condition: e.target.value }))}
                >
                  <option value="">Select condition</option>
                  {conditionOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {!editProduct.condition && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
              {/* Location */}
              <div>
                <label className="font-semibold block mb-1">Location</label>
                <input
                  className={`w-full border rounded px-3 py-2 focus:ring focus:ring-blue-200 ${!editProduct.location ? 'border-red-400' : ''}`}
                  value={editProduct.location || ''}
                  onChange={e => setEditProduct((p: any) => ({ ...p, location: e.target.value }))}
                  placeholder="Location"
                />
                {!editProduct.location && <div className="text-red-500 text-xs mt-1">Required</div>}
              </div>
            </div>
          )}
        </Dialog>
        {isLoading && (
          <div className="p-4 flex justify-center">
            <ProgressSpinner
              style={{ width: '40px', height: '40px' }}
              strokeWidth="6"
              fill="transparent"
              animationDuration="1s"
            />
          </div>
        )}
        <Toast ref={toast} />
      </div>
    </div>
        {!isLoading && products.length > 0 && (
          <SimilarProductsCarousel products={products} />
        )}
    </>
  );
}


