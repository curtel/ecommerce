const fs = require('fs');
const path = require('path');

// Hàm lấy danh sách hình ảnh từ thư mục upload/images
function getImagesFromUploadFolder() {
    const uploadPath = path.join(__dirname, 'upload/images');
    try {
        const files = fs.readdirSync(uploadPath);
        return files
            .filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))
            .map(file => `http://localhost:4000/images/${file}`);
    } catch (error) {
        console.error('Error reading upload folder:', error);
        return [];
    }
}

// Hàm tạo dữ liệu mẫu
function generateSampleData(num) {
    const categories = ["men", "women", "kid"];
    const names = [
        "Elegant Summer Dress", "Business Suit", "Casual Outfit",
        "Formal Wear", "Party Dress", "Sport Outfit",
        "Winter Collection", "Spring Style", "Autumn Fashion"
    ];
    const data = [];
    const images = getImagesFromUploadFolder();
    
    if (images.length === 0) {
        console.error('No images found in upload folder');
        return [];
    }

    for (let i = 0; i < num; i++) {
        const randomImage = images[Math.floor(Math.random() * images.length)];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const newPrice = Math.floor(Math.random() * 50) + 50; // Giá mới từ 50-100
        const oldPrice = newPrice + Math.floor(Math.random() * 50); // Giá cũ cao hơn giá mới 0-50
        const available = Math.random() < 0.5; // true hoặc false ngẫu nhiên

        const item = {
            id: i + 1,
            name: randomName,
            image: randomImage,
            category: randomCategory,
            new_price: newPrice,
            old_price: oldPrice,
            available: available,
            date: new Date().toISOString(),
            detail_images: [
                images[Math.floor(Math.random() * images.length)],
                images[Math.floor(Math.random() * images.length)],
                images[Math.floor(Math.random() * images.length)]
            ]
        };

        data.push(item);
    }
    
    return data;
}

module.exports = { generateSampleData };
