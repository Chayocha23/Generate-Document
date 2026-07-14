console.log("QC Form Universal Free Spatial Navigation v5.0 - Strictly Aligned.");

document.addEventListener("keydown", function (e) {
    const active = document.activeElement;

    // ตรวจสอบว่าเป็นช่องกรอกข้อมูลที่มีคลาส table-input หรือ header-input หรือไม่
    if (!active || (!active.classList.contains("table-input") && !active.classList.contains("header-input"))) return;

    const allowedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (!allowedKeys.includes(e.key)) return;

    // รวบรวมฟิลด์อินพุตทั้งหมดในหน้าเพจ
    const allInputs = Array.from(document.querySelectorAll(".table-input, .header-input"));
    const activeRect = active.getBoundingClientRect();

    // หาจุดกึ่งกลาง (X, Y) ของช่องปัจจุบัน
    const activeX = activeRect.left + activeRect.width / 2;
    const activeY = activeRect.top + activeRect.height / 2;

    let bestMatch = null;
    let minScore = Infinity;

    allInputs.forEach(input => {
        if (input === active) return;

        const rect = input.getBoundingClientRect();
        const inputX = rect.left + rect.width / 2;
        const inputY = rect.top + rect.height / 2;

        // หาระยะห่างในแนวแกน X และ แกน Y
        const dx = inputX - activeX;
        const dy = inputY - activeY;

        let isValidDirection = false;

        // คัดกรองทิศทางตามปุ่มที่กดก่อน
        if (e.key === "ArrowRight" && dx > 0) isValidDirection = true;
        if (e.key === "ArrowLeft" && dx < 0) isValidDirection = true;
        if (e.key === "ArrowDown" && dy > 0) isValidDirection = true;
        if (e.key === "ArrowUp" && dy < 0) isValidDirection = true;

        if (isValidDirection) {
            let score = Infinity;

            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                // สำหรับซ้าย-ขวา: เน้นช่องที่อยู่ระนาบแถวเดียวกัน (ความสูง Y ต่างกันไม่เกิน 15px)
                if (Math.abs(dy) <= 15) {
                    score = Math.abs(dx); // ได้คะแนนดีที่สุดตามระยะแกน X
                } else {
                    // หากจำเป็นต้องเปลี่ยนแถว ให้ปรับตัวคูณลงเพื่อให้เลื่อนหาช่องที่สมเหตุสมผลถัดไป
                    score = Math.abs(dx) + Math.abs(dy) * 4;
                }
            } else {
                // สำหรับขึ้น-ลง: เน้นช่องที่อยู่ในคอลัมน์แนวตั้งเดียวกันอย่างเคร่งครัด
                // ตรวจสอบแนวพิกัดแกน X ว่าเยื้องห่างกันไม่เกิน 25px (ล็อกให้อยู่คอลัมน์เดียวกัน)
                if (Math.abs(dx) <= 25) {
                    score = Math.abs(dy); // ให้คะแนนจากระยะห่างแนวตั้งตรงๆ
                } else {
                    // หากสลับคอลลัมน์หรือโดดข้ามตาราง ให้เพิ่ม Penalty (คะแนนความต่าง) มหาศาลเพื่อป้องกันการกระโดด
                    score = Math.abs(dy) + Math.abs(dx) * 50;
                }
            }

            if (score < minScore) {
                minScore = score;
                bestMatch = input;
            }
        }
    });

    // หากพบช่องเป้าหมายที่เหมาะสมที่สุด ให้เปลี่ยนโฟกัสเคลื่อนย้ายไปทันที
    if (bestMatch) {
        e.preventDefault(); // ป้องกันหน้าจอเลื่อนขยับสั่นเวลาพิมพ์ข้อมูล
        bestMatch.focus();

        // ย้ายตัวกะพริบ Cursor ไปไว้หลังสุดของข้อความเพื่อให้พิมพ์ต่อได้ไหลลื่นทันที
        if (bestMatch.isContentEditable) {
            try {
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(bestMatch);
                range.collapse(false); // เลื่อนเคอร์เซอร์ไปต่อท้ายสุด
                sel.removeAllRanges();
                sel.addRange(range);
            } catch (err) {
                // ป้องกัน Error ในระบบเบราว์เซอร์กรณีช่องเป็นค่าว่างเปล่า
            }
        }
    }
});