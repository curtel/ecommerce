const fs = require('fs');

// Mảng các URL hình ảnh để random
const imageArray = [
  "http://localhost:4000/images/product_1713593283352.png",
  "http://localhost:4000/images/product_1713636142535.png",
  "http://localhost:4000/images/product_1713593274292.png",
  "http://localhost:4000/images/product_1713593347232.png",
  "http://localhost:4000/images/product_1713592758814.png",
];

// Hàm tạo dữ liệu mẫu
function generateSampleData(num) {
  const categories = ["men", "women", "kids"];
  const names = ["sahasra", "arjun", "krishna", "meera"];
  const data = [];
  
  for (let i = 0; i < num; i++) {
    const randomImage = imageArray[Math.floor(Math.random() * imageArray.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const newPrice = Math.floor(Math.random() * 50) + 50; // Giá mới từ 50-100
    const oldPrice = newPrice + Math.floor(Math.random() * 50); // Giá cũ cao hơn giá mới 0-50
    const available = Math.random() < 0.5; // true hoặc false ngẫu nhiên

    const item = {
    //   _id: {
    //     $oid: crypto.randomUUID(), // Sinh UUID ngẫu nhiên
    //   },
      id: i + 1,
      name: randomName,
      image: randomImage,
      category: randomCategory,
      new_price: newPrice,
      old_price: oldPrice,
      available: available,
      date: {
        $date: new Date().toISOString(), // Thời gian hiện tại
      },
      __v: 0,
    };

    data.push(item);
  }
  
  return data;
}

// Sinh dữ liệu mẫu
const sampleData = generateSampleData(10);

// Xuất ra file JSON
fs.writeFileSync('sample_data.json', JSON.stringify(sampleData, null, 4), 'utf-8');

console.log("Dữ liệu đã được lưu vào file sample_data.json");
