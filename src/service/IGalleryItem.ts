export default interface IGalleryItem {
  id: string;
  // 类型,'图片' | '视频'
  type: "pic" | "video";
  // 浏览量
  count: number;
  // 标题
  title: string;
  // logo图片的url
  logoUrl: string;
  // 资源url数组
  resource: string[];
}
