import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Compass,
  Home as HomeIcon,
  ImagePlus,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import interior from "@/assets/read-interior.jpg";
import fashion from "@/assets/read-fashion.jpg";
import food from "@/assets/read-food.jpg";
import travel from "@/assets/read-travel.jpg";
import product from "@/assets/read-product.jpg";
import nook from "@/assets/read-nook.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "READ — 저장에서 발견으로" },
      { name: "description", content: "이미지를 저장하면 취향의 패턴을 발견해주는 비주얼 아카이브" },
      { property: "og:title", content: "READ — 저장에서 발견으로" },
      { property: "og:description", content: "저장한 이미지 속 취향과 패턴을 발견하세요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type View = "onboarding" | "home" | "add" | "detail" | "discover";
type Item = { id: number; image: string; category: string; title: string; analyzing?: boolean };

const initialItems: Item[] = [
  { id: 1, image: interior, category: "공간", title: "햇살이 머무는 거실" },
  { id: 2, image: fashion, category: "패션", title: "코발트 블루 레이어" },
  { id: 3, image: nook, category: "공간", title: "조용한 독서 코너" },
  { id: 4, image: food, category: "음식", title: "주말의 파스타" },
  { id: 5, image: travel, category: "여행", title: "제주의 푸른 가장자리" },
  { id: 6, image: product, category: "제품", title: "블루 테이블 램프" },
];

const categories = ["전체", "공간", "패션", "음식", "여행", "제품"];
const gallery = [interior, fashion, nook, food, travel, product];
const firstItem: Item = { id: 1, image: interior, category: "공간", title: "햇살이 머무는 거실" };

function AppButton({ children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={className} {...props}>{children}</button>;
}

function Index() {
  const [view, setView] = useState<View>("home");
  const [previous, setPrevious] = useState<View>("home");
  const [items, setItems] = useState(initialItems);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [selected, setSelected] = useState<number[]>([]);
  const [activeItem, setActiveItem] = useState<Item>(firstItem);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toast, setToast] = useState("");

  const filtered = useMemo(
    () => activeCategory === "전체" ? items : items.filter((item) => item.category === activeCategory),
    [activeCategory, items],
  );

  const openDetail = (item: Item, from: View = view) => {
    setActiveItem(item);
    setPrevious(from);
    setView("detail");
  };

  const saveSelected = () => {
    const added = selected.flatMap((index, offset) => {
      const image = gallery[index];
      if (!image) return [];
      return [{
      id: Date.now() + offset,
      image,
      category: "분석 중",
      title: "새로운 저장물",
      analyzing: true,
      }];
    });
    setItems((current) => [...added, ...current]);
    setSelected([]);
    setView("home");
    setToast(`${added.length}개의 이미지를 저장했어요`);
    window.setTimeout(() => setToast(""), 2400);
  };

  if (view === "onboarding") return <Onboarding onStart={() => setView("home")} />;
  if (view === "add") return <Add selected={selected} setSelected={setSelected} onCancel={() => setView("home")} onSave={saveSelected} />;
  if (view === "detail") return <Detail item={activeItem} deleteOpen={deleteOpen} setDeleteOpen={setDeleteOpen} onBack={() => setView(previous)} onDelete={() => { setItems((current) => current.filter((item) => item.id !== activeItem.id)); setDeleteOpen(false); setView("home"); }} />;

  return (
    <main className="app-shell">
      <div className="phone-surface">
        {view === "home" ? (
          <>
            <header className="topbar">
              <div>
                <span className="wordmark">READ<span className="wordmark-dot">.</span></span>
                <p className="date-line">WED, 09 SEP</p>
              </div>
              <AppButton className="icon-button" aria-label="검색"><Search size={21} /></AppButton>
            </header>
            <section className="home-intro">
              <p className="eyebrow">READ / PERSONAL INDEX</p>
              <h1>저장한 것에서<br /><span>발견한 것</span></h1>
              <div className="archive-summary"><span>{items.length.toString().padStart(2, "0")} SAVED</span><span>05 CATEGORIES</span><span>SEP 2026</span></div>
            </section>
            <nav className="category-scroll" aria-label="카테고리 필터">
              {categories.map((category) => (
                <AppButton key={category} className={`filter-chip ${activeCategory === category ? "is-active" : ""}`} onClick={() => setActiveCategory(category)}>{category}</AppButton>
              ))}
            </nav>
            <section className="archive-list" aria-label="저장한 항목">
              {filtered.map((item, index) => (
                <AppButton key={item.id} className="archive-row" onClick={() => openDetail(item, "home")}>
                  <span className="row-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="row-copy"><span className="row-meta">{item.analyzing ? "PROCESSING" : item.category} · 3 DAYS AGO</span><strong>{item.title}</strong><span className="row-tags">{item.analyzing ? "이미지를 읽고 있어요" : index % 2 ? "#blue  #object  #daily" : "#light  #wood  #minimal"}</span></span>
                  <span className="row-image"><img src={item.image} alt="" width={1024} height={1280} loading={index > 1 ? "lazy" : undefined} /></span>
                  <ChevronRight className="row-arrow" size={17} />
                </AppButton>
              ))}
            </section>
          </>
        ) : (
          <Discover items={items} onOpen={(item) => openDetail(item, "discover")} />
        )}

        <AppButton className="floating-add" aria-label="이미지 추가" onClick={() => setView("add")}><Plus size={27} /></AppButton>
        <BottomNav view={view} onChange={setView} />
        {toast && <div className="toast"><Check size={17} /> {toast}</div>}
      </div>
    </main>
  );
}

function BottomNav({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  return (
    <nav className="bottom-nav" aria-label="주요 메뉴">
      <AppButton className={view === "home" ? "is-current" : ""} onClick={() => onChange("home")}><HomeIcon size={21} /><span>Home</span></AppButton>
      <span className="nav-gap" />
      <AppButton className={view === "discover" ? "is-current" : ""} onClick={() => onChange("discover")}><Compass size={22} /><span>Discover</span></AppButton>
    </nav>
  );
}

function Onboarding({ onStart }: { onStart: () => void }) {
  return <main className="app-shell"><section className="phone-surface onboarding">
    <span className="wordmark light">READ<span className="wordmark-dot">.</span></span>
    <div className="onboarding-index"><span>01 SAVE</span><span>02 ORGANIZE</span><span>03 DISCOVER</span><span>04 READ AGAIN</span></div>
    <div className="onboarding-copy"><p className="eyebrow">SAVE FIRST. DISCOVER LATER.</p><h1>저장만 하세요,<br />정리는 저희가 할게요</h1><p>흩어진 이미지를 읽을 수 있는 기록으로.<br />당신이 반복해서 고른 것들을 발견해요.</p></div>
    <AppButton className="primary-button" onClick={onStart}><ImagePlus size={19} />사진첩에서 여러 장 가져오기</AppButton>
    <AppButton className="text-button" onClick={onStart}>나중에 할게요, 하나씩 저장할게요</AppButton>
  </section></main>;
}

function Add({ selected, setSelected, onCancel, onSave }: { selected: number[]; setSelected: (value: number[]) => void; onCancel: () => void; onSave: () => void }) {
  const toggle = (index: number) => setSelected(selected.includes(index) ? selected.filter((item) => item !== index) : [...selected, index]);
  return <main className="app-shell"><section className="phone-surface add-screen">
    <header className="plain-header"><AppButton onClick={onCancel}>취소</AppButton><h1>이미지 추가</h1><AppButton className="save-text" disabled={!selected.length} onClick={onSave}>저장</AppButton></header>
    <div className="album-title"><div><p className="eyebrow">RECENTS</p><h2>최근 항목</h2></div><span>{gallery.length}</span></div>
    <div className="photo-picker">{gallery.map((image, index) => { const order = selected.indexOf(index); return <AppButton key={image} onClick={() => toggle(index)}><img src={image} alt={`최근 사진 ${index + 1}`} width={1024} height={1280} loading="lazy" />{order >= 0 && <span className="selection-number">{order + 1}</span>}</AppButton>; })}</div>
    <footer className="selection-footer"><span>{selected.length ? `${selected.length}장 선택됨` : "이미지를 선택하세요"}</span><AppButton className="round-next" disabled={!selected.length} onClick={onSave} aria-label="선택한 이미지 저장"><ChevronRight size={22} /></AppButton></footer>
  </section></main>;
}

function Detail({ item, deleteOpen, setDeleteOpen, onBack, onDelete }: { item: Item; deleteOpen: boolean; setDeleteOpen: (open: boolean) => void; onBack: () => void; onDelete: () => void }) {
  const tags = item.category === "패션" ? ["패션", "블루", "레이어드", "클래식", "저채도"] : ["공간", "우드", "자연광", "저채도", "미니멀"];
  return <main className="app-shell"><section className="phone-surface detail-screen">
    <header className="detail-text-header"><AppButton onClick={onBack} aria-label="뒤로가기"><ArrowLeft size={20} /></AppButton><span>READ / ITEM 01</span><AppButton onClick={() => setDeleteOpen(true)} aria-label="삭제"><Trash2 size={18} /></AppButton></header>
    <section className="detail-copy"><p className="eyebrow">AI GENERATED NOTE</p><h1>{item.title}</h1>{item.analyzing ? <div className="analyzing-block"><span /><span /><p>이미지를 분석하고 있어요</p></div> : <><p className="analysis-text">차분한 색과 자연 소재가 만드는 편안한 분위기를 반복해서 저장하고 있어요. 강한 장식보다 빛, 질감, 여백이 있는 장면에 시선이 머뭅니다.</p><dl className="detail-data"><div><dt>CATEGORY</dt><dd>{tags[0]}</dd></div><div><dt>COLOR</dt><dd>저채도 / 내추럴</dd></div><div><dt>MOOD</dt><dd>조용함 / 미니멀</dd></div><div><dt>SAVED</dt><dd>3일 전</dd></div></dl><div className="tag-list">{tags.map((tag) => <span key={tag}>#{tag}</span>)}</div></>}<figure className="source-figure"><img src={item.image} alt={item.title} width={1024} height={1280} /><figcaption>ORIGINAL REFERENCE / 01</figcaption></figure></section>
    {deleteOpen && <div className="sheet-backdrop" onClick={() => setDeleteOpen(false)}><div className="bottom-sheet" onClick={(event) => event.stopPropagation()}><div className="sheet-handle" /><h2>이 저장물을 삭제할까요?</h2><p>분석 데이터도 함께 삭제돼요.</p><AppButton className="danger-button" onClick={onDelete}>삭제</AppButton><AppButton className="sheet-cancel" onClick={() => setDeleteOpen(false)}>취소</AppButton></div></div>}
  </section></main>;
}

function Discover({ items, onOpen }: { items: Item[]; onOpen: (item: Item) => void }) {
  const evidenceItems = [items[0], items[2], items[5]].filter((item): item is Item => item !== undefined);
  return <section className="discover-screen"><header className="discover-header"><span className="wordmark">READ<span className="wordmark-dot">.</span></span><p className="eyebrow">DISCOVER / 02</p><h1>당신의 선택에서<br /><span>발견한 것</span></h1><p className="discover-note">저장된 항목 사이에서 반복되는 단어와 조합을 읽었습니다.</p></header>
    <div className="insight-list">
      <article className="insight-card featured"><div className="insight-number">01</div><p className="pattern-label">COMBINATION · 조합</p><h2>자연광과 우드 소재가<br />함께 있는 공간을<br />자주 저장했어요.</h2><p className="insight-body">공간 저장물 3개 중 2개에서 ‘자연광’과 ‘우드’가 함께 나타났어요. 밝고 차분한 공간의 조합에 반복적으로 시선이 머물고 있습니다.</p><ol className="evidence-text">{evidenceItems.map((item, index) => <li key={item.id}><AppButton onClick={() => onOpen(item)}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}<ChevronRight size={14} /></AppButton></li>)}</ol><AppButton className="evidence-link" onClick={() => evidenceItems[0] && onOpen(evidenceItems[0])}>근거 저장물 읽기 <ChevronRight size={16} /></AppButton></article>
      <article className="insight-card"><div className="insight-number">02</div><p className="pattern-label">REPEAT · 반복</p><h2>선명한 블루를<br />포인트로 고르고 있어요.</h2><p className="insight-body">패션과 제품처럼 서로 다른 분류에서도 같은 색이 이어집니다.</p><p className="keyword-line">BLUE / COBALT / FOCUS</p></article>
    </div>
  </section>;
}