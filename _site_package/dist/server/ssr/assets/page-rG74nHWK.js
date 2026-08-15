import { a as require_react, o as __toESM, t as require_jsx_runtime } from "../index.js";
//#region app/page.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var listings = [
	{
		id: 1,
		title: "朝阳公园旁的安静次卧",
		area: "朝阳 · 望京",
		location: "融科橄榄城",
		price: 3600,
		date: "9月1日起",
		tags: ["租赁已验证", "租金记录已验证"],
		image: "#d9e7dc",
		accent: "#7da58a"
	},
	{
		id: 2,
		title: "地铁 4 号线 · 阳光主卧转租",
		area: "海淀 · 中关村",
		location: "科源小区",
		price: 4250,
		date: "8月20日起",
		tags: ["租赁已验证", "房东已确认"],
		image: "#eadcc8",
		accent: "#c28e55"
	},
	{
		id: 3,
		title: "五道口步行 8 分钟，带阳台",
		area: "海淀 · 五道口",
		location: "华清嘉园",
		price: 3900,
		date: "9月15日起",
		tags: ["租赁已验证"],
		image: "#d9e1ed",
		accent: "#7791b6"
	},
	{
		id: 4,
		title: "新装修一居室，短租友好",
		area: "东城 · 东直门",
		location: "东环广场",
		price: 5800,
		date: "8月28日起",
		tags: ["租赁已验证", "租金记录已验证"],
		image: "#e7d9dd",
		accent: "#b5808c"
	}
];
function Home() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [filter, setFilter] = (0, import_react.useState)("全部");
	const [showPublish, setShowPublish] = (0, import_react.useState)(false);
	const [saved, setSaved] = (0, import_react.useState)([]);
	const filtered = (0, import_react.useMemo)(() => listings.filter((item) => {
		const hit = `${item.title}${item.area}${item.location}`.includes(query);
		const verified = filter === "全部" || item.tags.includes(filter);
		return hit && verified;
	}), [query, filter]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "nav shell",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "brand",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "brand-mark",
						children: "租"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["租迹 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "ZUJI" })] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "nav-links",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#explore",
							children: "找房"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#trust",
							children: "信任机制"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "#about",
							children: "关于租迹"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "ghost-button",
					onClick: () => setShowPublish(true),
					children: ["发布转租 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "＋" })]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "hero shell",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hero-copy",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "eyebrow",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dot" }), " 真实租客的转租平台"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [
						"少一点套路，",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "多一点真实。" })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "hero-sub",
						children: [
							"每一条房源，都经过身份与租赁关系验证。",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"让转租回到租客之间，简单、透明、有依据。"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "search-box",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "search-icon",
								children: "⌕"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: query,
								onChange: (e) => setQuery(e.target.value),
								placeholder: "搜索城市、小区或地铁站"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }),
								children: "开始找房"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "hero-note",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "✓" }), " 实名认证 · 合同匹配 · 支付记录可查"]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "hero-art",
				"aria-label": "租迹信任卡片示意图",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "orbit orbit-one" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "orbit orbit-two" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "trust-card main-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-top",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mini-logo",
										children: "租"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "租迹认证" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "check",
										children: "✓"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card-line wide" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "card-line" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card-footer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "租赁关系" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "已验证" })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "float-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "float-icon",
							children: "⌁"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "租金记录" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "连续 6 个月 · 已核验" })] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "stamp",
						children: [
							"真实",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"发生过"
						]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "trust-strip",
			id: "trust",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shell trust-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "trust-number",
							children: "01"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "先验证身份" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "KYC 实名认证，确认你是谁" })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "trust-number",
							children: "02"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "再验证租赁" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "合同信息与身份真实匹配" })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "trust-number",
							children: "03"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "持续可追溯" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "支付记录、房东确认逐步加入" })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "trust-quote",
						children: [
							"“不靠一张嘴，",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "用证据说话。" }),
							"”"
						]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "explore shell",
			id: "explore",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "section-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "正在发生的真实转租"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "看看附近有什么" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "#all",
						children: ["查看全部房源 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "→" })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "filters",
					children: [
						"全部",
						"租赁已验证",
						"租金记录已验证",
						"房东已确认"
					].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: filter === item ? "active" : "",
						onClick: () => setFilter(item),
						children: item
					}, item))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "listing-grid",
					children: filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "listing",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "listing-image",
							style: { background: item.image },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "image-shape",
									style: { background: item.accent }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "verified-badge",
									children: "✓ 已验证"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: `save ${saved.includes(item.id) ? "saved" : ""}`,
									onClick: () => setSaved((s) => s.includes(item.id) ? s.filter((x) => x !== item.id) : [...s, item.id]),
									children: saved.includes(item.id) ? "♥" : "♡"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "listing-body",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "listing-meta",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.area }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.date })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: item.title }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "location",
									children: ["⌖ ", item.location]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "listing-bottom",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
										"¥",
										item.price.toLocaleString(),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: " /月" })
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "tag-row",
										children: item.tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tag === "租金记录已验证" ? "¥ 记录已验" : tag === "房东已确认" ? "房东已确认" : "合同已匹配" }, tag))
									})]
								})
							]
						})]
					}, item.id))
				}),
				filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "empty",
					children: "没有找到符合条件的房源，换个关键词试试。"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "publish-banner shell",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: "你也有房子要转租？"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [
				"把真实的租赁经历，",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { children: "交给下一个租客。" })
			] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "dark-button",
				onClick: () => setShowPublish(true),
				children: ["我想发布转租 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "→" })]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
			className: "footer shell",
			id: "about",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "brand",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "brand-mark",
						children: "租"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["租迹 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "ZUJI" })] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "让转租回到租客之间。" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "© 2026 ZUJI" })
			]
		}),
		showPublish && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "modal-backdrop",
			onClick: () => setShowPublish(false),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "modal",
				onClick: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "modal-close",
						onClick: () => setShowPublish(false),
						children: "×"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow",
						children: "发布前的第一步"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "先让我们认识真实的你" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "modal-copy",
						children: "为了保护每一位租客，发布转租需要完成身份认证，并上传能证明租赁关系的材料。"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "verify-steps",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "KYC 实名认证" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "证件 + 人脸识别" })
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "上传租赁合同" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "姓名与合同自动匹配" })
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "补充支付记录" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "可选，提升信任等级" })
							] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "dark-button full",
						onClick: () => setShowPublish(false),
						children: ["开始认证 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "→" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
						className: "privacy",
						children: "你的原始材料仅用于审核，不会公开展示"
					})
				]
			})
		})
	] });
}
//#endregion
export { Home as default };
