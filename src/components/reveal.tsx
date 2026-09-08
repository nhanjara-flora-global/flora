/**
 * Scroll reveal: children of a Reveal group fade and rise into place, staggered.
 *
 * Content ships visible. The hidden starting state is applied only by
 * RevealScript, which arms the CSS and installs the observer in the same pass —
 * so if the script never runs (JS off, reduced motion, hydration failure)
 * nothing is ever hidden. The script also un-arms itself if setup throws.
 */

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Reveal({ children, className }: Props) {
  return (
    // RevealScript gắn data-revealed lên chính div này trước khi React hydrate
    // (nhóm nằm trên màn hình đầu tiên khớp observer ngay). Attribute do script
    // sở hữu, không phải React — giống cách <html> xử lý data-reveal.
    <div className={className} data-reveal-group="" suppressHydrationWarning>
      {children}
    </div>
  );
}

/**
 * Runs before <main> paints, so arming causes no flash of visible content.
 * A MutationObserver picks up groups added by client-side navigation, which
 * would otherwise stay hidden — DOMContentLoaded only fires on a full load.
 */
const SCRIPT = `(function(){
var d=document,root=d.documentElement,w=window;
if(!('IntersectionObserver' in w)||!('MutationObserver' in w))return;
try{if(w.matchMedia('(prefers-reduced-motion: reduce)').matches)return;}catch(e){return;}
var io=null;
function arm(g){
if(g.__rv)return;g.__rv=1;
io.observe(g);}
function scan(n){
if(!n||n.nodeType!==1)return;
if(n.hasAttribute('data-reveal-group'))arm(n);
var f=n.querySelectorAll('[data-reveal-group]');for(var i=0;i<f.length;i++)arm(f[i]);}
root.setAttribute('data-reveal','on');
function init(){try{
io=new IntersectionObserver(function(es){for(var i=0;i<es.length;i++){if(!es[i].isIntersecting)continue;es[i].target.setAttribute('data-revealed','');io.unobserve(es[i].target);}},{threshold:0.15,rootMargin:'0px 0px -8% 0px'});
scan(d.body);
new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var a=ms[i].addedNodes;for(var j=0;j<a.length;j++)scan(a[j]);}}).observe(d.body,{childList:true,subtree:true});
}catch(e){root.removeAttribute('data-reveal');}}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',init);else init();
})();`;

export function RevealScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
