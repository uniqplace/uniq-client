import React, { useState } from "react";
import { Carousel } from "primereact/carousel";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import type { Product } from "../../../types";

interface SimilarProductsCarouselProps {
  products: Product[];
}

const SimilarProductsCarousel: React.FC<SimilarProductsCarouselProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  const openDialog = (product: Product) => {
    setSelectedProduct(product);
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setSelectedProduct(null);
    setDialogVisible(false);
  };

  const productTemplate = (product: Product) => {
    const imageUrl = product.images?.[0] || "";
    return (
      <Card
        title={product.title}
        subTitle={`$${product.price}`}
        className="p-m-2"
        style={{ width: "250px" }}
      >
        <div
          style={{
            height: "150px",
            backgroundColor: imageUrl ? undefined : "#f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.title}
              style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "cover" }}
              onError={(e) => ((e.target as HTMLImageElement).src = "")}
            />
          ) : (
            <i className="pi pi-image" style={{ fontSize: "2rem", color: "#aaa" }}></i>
          )}
        </div>
        <p style={{ fontSize: "0.9rem", height: "40px", overflow: "hidden" }}>
          {product.description}
        </p>
        <Button
          label="View Details"
          icon="pi pi-eye"
          onClick={() => openDialog(product)}
          className="p-button-sm p-button-outlined"
        />
      </Card>
    );
  };

  return (
    <div>
      <Carousel
        value={products}
        itemTemplate={productTemplate}
        numVisible={3}
        numScroll={1}
        responsiveOptions={[
          {
            breakpoint: "1024px",
            numVisible: 3,
            numScroll: 1,
          },
          {
            breakpoint: "768px",
            numVisible: 2,
            numScroll: 1,
          },
          {
            breakpoint: "560px",
            numVisible: 1,
            numScroll: 1,
          },
        ]}
      />

      {selectedProduct && (
        <Dialog
          header={selectedProduct.title}
          visible={dialogVisible}
          style={{ width: "50vw" }}
          modal
          onHide={closeDialog}
        >
          <div>
            <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "10px" }}>
              {selectedProduct.images.length > 0 ? (
                selectedProduct.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`img-${idx}`}
                    style={{ height: "100px", objectFit: "cover", borderRadius: "4px" }}
                    onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                  />
                ))
              ) : (
                <div
                  style={{
                    height: "100px",
                    width: "100px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i className="pi pi-image" style={{ fontSize: "2rem", color: "#aaa" }}></i>
                </div>
              )}
            </div>

            <p><strong>Description:</strong> {selectedProduct.description}</p>
            <p><strong>Price:</strong> ${selectedProduct.price}</p>
            <p><strong>Condition:</strong> <Tag value={selectedProduct.condition}  /></p>
            <p><strong>Creator:</strong> {selectedProduct.creator?.name}</p>
            <p><strong>Tags:</strong> {selectedProduct.tags?.map((tag, idx) => <Tag key={idx} value={tag} className="p-mr-1" />)}</p>
            <p><strong>Location:</strong> {selectedProduct.location}</p>
            <p><strong>Status:</strong> {selectedProduct.status}</p>
            <p><strong>Created At:</strong> {new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
          </div>
        </Dialog>
      )}
    </div>
  );
};
export default SimilarProductsCarousel;
