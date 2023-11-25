import styles from "./DetailProductModal.module.scss";
import PropTypes from "prop-types";
import numeral from "numeral";
import "numeral/locales/vi";
numeral.locale("vi");
const DetailModal = ({
  thumb,
  name,
  description,
  price,
  discount,
  supplier,
  category,
  stock,
}) => {
  return (
    <div className={styles.detail}>
      <div className={styles.thumb}>
        <img src={thumb} alt={name} />
      </div>
      <div className={styles.content}>
        <p className={styles.name}>{name}</p>
        <p>{description}</p>
        <p>Danh mục: {category}</p>
        <p>Nhà cung cấp: {supplier}</p>
        <p>Tồn kho: {stock}</p>
        <div className={styles.money}>
          <p>Giá: {numeral(price).format("0,0$")}</p>
          <p>Giảm giá: {discount}%</p>
        </div>
      </div>
    </div>
  );
};
DetailModal.propTypes = {
  thumb: PropTypes.string,
  name: PropTypes.string,
  price: PropTypes.string,
  description: PropTypes.string,
  discount: PropTypes.string,
  category: PropTypes.string,
  supplier: PropTypes.string,
  stock: PropTypes.string,
};

export default DetailModal;
