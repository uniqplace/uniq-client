import { useState, useRef } from "react";
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
  validateSpec,
  lockSpec,
} from "../slices/aiProductThunks";
import { create } from "lodash";

export default function AiProductDebugPanel() {
  const dispatch = useAppDispatch();
  const aiProduct = useAppSelector((state: RootState) => state.aiProduct);

  const [messages, setMessages] = useState<
    { sender: "user" | "ai"; text: string }[]
  >(() => {
    try {
      const data = localStorage.getItem("aiProductChat");
      if (data) return JSON.parse(data);
    } catch (e) { }
    return [];
  });

  const [newParam, setNewParam] = useState<{
    label: string;
    type: ProductParam["type"];
    requiredByAI: boolean;
  }>({ label: "", type: "text", requiredByAI: false });

  const [userText, setUserText] = useState("");
  const [showAddParamRow, setShowAddParamRow] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const paramsTableRef = useRef<HTMLDivElement>(null);
  const addParamRowRef = useRef<HTMLInputElement>(null);

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

  return (
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
                          param.value ?? <span className="text-slate-400">-</span>
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
                              id: Math.random().toString(36).slice(2),
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
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 flex items-center gap-2"
            onClick={async () => {
              try {
                const validateRes = await dispatch(validateSpec(aiProduct.params));
                if (validateRes?.payload?.success) {
                  const lockRes = await dispatch(
                    lockSpec({
                      productData: {
                        title: aiProduct.title || "AI Generated Product",
                        description: aiProduct.description || "This product was created using AI assistance.",
                        price: aiProduct.price ,
                        images: aiProduct.images || [], 
                        creator: useAppSelector((state: RootState) => state.user.id),
                        category: aiProduct.category,
                        subCategories: aiProduct.subCategories ,
                        status: aiProduct.status,
                        condition: aiProduct.condition || 'new',
                        location: aiProduct.location || "",
                        tags: aiProduct.tags || [],
                        params: aiProduct.params,
                        createdByAI: aiProduct.createdByAI || true,
                        aiVersion: aiProduct.aiVersion,
                      }
                    })
                  );
                  if (lockRes?.payload?.success) {
                    window.alert("Your product has been saved and locked successfully!");
                  } else {
                    window.alert(lockRes?.payload?.error || "Failed to lock the product.");
                  }
                } else {
                  window.alert(
                    validateRes?.payload?.error ||
                    "Validation failed. Please check your product details."
                  );
                }
              } catch (e) {
                window.alert("An unexpected error occurred.");
              }
            }}
          >
            <Lock size={16} /> Yes! I'm sure about my product
          </button>
        </div>
      </div>
    </div>
  );
}

