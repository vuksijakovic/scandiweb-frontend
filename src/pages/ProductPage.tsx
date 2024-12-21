  // @ts-ignore
  import React, { useState, useEffect } from 'react';
  import { useParams,useNavigate } from 'react-router-dom';
  import { useQuery, gql } from '@apollo/client';
  import styled from 'styled-components';
  import { useCart } from '../CartContext.tsx';

  const GET_PRODUCT = gql`
    query GetProduct($id: String!) {
      product(id: $id) {
        id
        name
        inStock
        gallery
        category
        description
        attributes {
          id
          name
          type
          items {
            id
            displayValue
            value
          }
        }
        prices {
          amount
          currency {
            symbol
          }
        }
        brand
      }
    }
  `;
  
  const Container = styled.div`
    display: flex;
    gap: 30px;
    padding: 120px;
    @media (max-width: 768px) {
      flex-direction: column;
      padding: 10px;
      padding-top: 100px;
    }
  `;

  const CarouselSection = styled.div`
    display: flex;
    width: 60%;
    
    @media (max-width: 768px) {
      flex-direction: column;
      width: 100%;
    }
  `;

  const Thumbnails = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 25px;
    margin-right:25px;
    height: 500px;
    @media (max-width: 768px) {
      flex-direction: row;
      align-items: center;
      justify-content: center;
      margin-bottom: 5px;
      gap: 5px;
      height:30px;
    }
  `;

  const Thumbnail = styled.img<{ isSelected: boolean }>`
    width: 80px;
    height: 80px;
    object-fit: cover;
    opacity: ${(props) => (props.isSelected ? '1' : '0.6')};
    cursor: pointer;
    margin-top:10px;
    @media(max-width:768px) {
      width: 50px;
    height: 50px;
    }
    &:hover {
      opacity: 1;
      
    }
  `;

  const MainImageContainer = styled.div`
    height:500px;
    flex: 1;
    display: flex;
    margin-top:40px;
    align-items: center;
    justify-content: center;
      position: relative; 
      @media(max-width:768px) {
      
    height: 300px;
    }
  `;

  const MainImage = styled.img`
    width: 100%;
    height: 500px;
    object-fit: cover;
    
    @media (max-width: 768px) {
      height: 300px;
    }
  `;

  const Details = styled.div`
    width: 40%;
    @media (max-width: 768px) {
      width: 100%;
    }
      h1 {
                    font-family: 'Raleway', sans-serif;

              }
  `;

  const AttributeContainer = styled.div`
    margin: 20px 0;
  `;

  const AttributeTitle = styled.p`
    font-weight: bold;
      font-family: 'Roboto Condensed', sans-serif;
    font-size: 18px;
    margin-bottom: 5px;
  `;


  const AttributeItem = styled.button<{ isSelected: boolean; isColor: boolean; value: string }>`
    padding: ${(props) => (props.isColor ? '15px' : '10px 20px')};
    margin: 5px;
    border: ${(props) =>
      props.isColor && props.isSelected
        ? '2px solid #5ECE7B' 
        : '1px solid black'}; 
    background-color: ${(props) =>
      props.isColor ? props.value : props.isSelected ? '#000' : '#fff'}; 
    color: ${(props) =>
      props.isColor
        ? 'transparent' 
        : props.isSelected
        ? '#fff' 
        : '#000'};
    cursor: pointer;
  font-family: 'Raleway', sans-serif;

    &:hover {
      opacity: 0.8;
    }
  `;
  const AddToCartButtonGray = styled.button`
  background-color: gray;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border: none;
  padding: 15px;
  width: 100%;
        font-family: 'Raleway', sans-serif;

`;

  const AddToCartButton = styled.button`
    background-color: #5ece7b;
          font-family: 'Raleway', sans-serif;
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    border: none;
    padding: 15px;
    width: 100%;
    cursor: pointer;

    &:hover {
      background-color: #4caf50;
    }
  `;

  const Price = styled.h3`
    margin: 20px 0;
    font-size: 1.3rem;
    color: #333;
          font-family: 'Raleway', sans-serif;

  `;

  const Description = styled.div`
    margin-top: 20px;
      font-family: 'Roboto Condensed', sans-serif;

    color: #555;
    line-height: 1.5;
  `;
  const ArrowButton = styled.button`
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 10px;
    cursor: pointer;
    z-index: 10;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }
  `;

  const ProductPage: React.FC = () => {
    const { productId } = useParams();
      // @ts-ignore
    const navigate = useNavigate();
      // @ts-ignore
 
    const { cartItems, setCartItems } = useCart();
    const { loading, error, data } = useQuery(GET_PRODUCT, { variables: { id: productId } });
   
     
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    
    function parseHTMLToReact(htmlString : string) {
      const template = document.createElement('template');
      template.innerHTML = htmlString.trim();
      // @ts-ignore
      function convertNodeToReact(node: any): any {
        if (node.nodeType === Node.TEXT_NODE) {
            const parts = node.textContent.split('\\n');
                  // @ts-ignore

            return parts.reduce((acc: any[], part, index) => {
                acc.push(part);
                if (index < parts.length - 1) {
                    acc.push(React.createElement('br', { key: `br-${index}` }));
                }
                return acc;
            }, []);
        }
    
        if (node.nodeType !== Node.ELEMENT_NODE) {
            return null;
        }
    
        const { tagName, attributes, childNodes } = node;
        const props: Record<string, any> = {};
    
        Array.from(attributes).forEach(attr => {
                // @ts-ignore
            props[attr.name] = attr.value;
        });
    
        const children = Array.from(childNodes).map(convertNodeToReact);
    
        return React.createElement(tagName.toLowerCase(), props, ...children);
    }
    
  
      const content = template.content.childNodes;
      return Array.from(content).map(convertNodeToReact);
  }
  console
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error loading product!</p>;
    const addToCart = () => {
      const newItem = {
        name: data.product.name,
        price: data.product.prices.amount,
        attributes: data.product.attributes.map((attribute: any) => ({
          name: attribute.name,
          items: attribute.items.map((item: any) => ({
            value: item.value,
            displayValue: item.displayValue,
          })),
          selectedValue: selectedAttributes[attribute.id] || attribute.items[0].value, 
        })),
        image: data.product.gallery[0],
        quantity: 1,
      };
  
      setCartItems((prevCartItems: any[]) => {
        const existingItem = prevCartItems.find((item) => {
          return (
            item.name === newItem.name &&
            JSON.stringify(item.attributes) === JSON.stringify(newItem.attributes)
          );
        });
    
        if (existingItem) {
          return prevCartItems.map((item) =>
            item === existingItem ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          return [...prevCartItems, newItem];
        }
      });
    };
    const toKebabCase = (str: string) => {
      return str
        .toLowerCase() 
        .replace(/\s+/g, "-")               
        .toLowerCase();                     
    };
    const selected = (selectedAttributes: Record<string, string>, attributesCount: number) => {
      return Object.keys(selectedAttributes).length === attributesCount;
    };
    
    const product = data.product;
    const handleAttributeSelect = (attributeId: string, itemId: string) => {
      setSelectedAttributes((prev) => ({ ...prev, [attributeId]: itemId }));
    };
    console.log(product);
    
    return (
      <Container>
        <CarouselSection data-testid='product-gallery'>
    <Thumbnails>
      {product.gallery.map((img: string, index: number) => (
        <Thumbnail
          key={index}
          src={img}
          isSelected={selectedImage === index}
          onClick={() => setSelectedImage(index)}
        />
      ))}
    </Thumbnails>
    <MainImageContainer>
      
      <ArrowButton
        style={{ left: "10px" }}
        onClick={() =>
          setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.gallery.length - 1))
        }
      >
        &#9664;
      </ArrowButton>

      <MainImage src={product.gallery[selectedImage]} alt="Product Image" />

      <ArrowButton
        style={{ right: "10px" }}
        onClick={() =>
          setSelectedImage((prev) => (prev < product.gallery.length - 1 ? prev + 1 : 0))
        }
      >
        &#9654;
      </ArrowButton>
    </MainImageContainer>
  </CarouselSection>


        <Details>
          <h1>{product.name}</h1>

          {data.product.attributes.map((attribute: any) => (
            <AttributeContainer key={attribute.id}>
              <AttributeTitle>{attribute.name.toUpperCase()}:</AttributeTitle>
              <div data-testid={`product-attribute-${toKebabCase(attribute.name)}`}>
                {attribute.items.map((item: any) => (
                  
                  <AttributeItem
                  data-testid={`product-attribute-${toKebabCase(attribute.name)}-${item.displayValue}`}
                    key={item.id}
                    isSelected={selectedAttributes[attribute.id] === item.id}
                    isColor={attribute.name === 'Color'}
                    value={item.value}
                    onClick={() => handleAttributeSelect(attribute.id, item.id)}
                  >
                    {attribute.name === 'Color' ? '' : item.displayValue}
                  </AttributeItem>
                ))}
              </div>
            </AttributeContainer>
          ))}
          <AttributeTitle>PRICE:</AttributeTitle>
          <Price>
             {product.prices.currency.symbol}
            {product.prices.amount}
          </Price>
          {product.inStock && selected(selectedAttributes, product.attributes.length) && (
  <AddToCartButton data-testid="add-to-cart" onClick={addToCart}>
    ADD TO CART
  </AddToCartButton>
)}
{product.inStock && !selected(selectedAttributes, product.attributes.length) && (
  <AddToCartButtonGray data-testid="add-to-cart" disabled>
    ADD TO CART
  </AddToCartButtonGray>
)}
          <Description id="content" data-testid='product-description'>
            {parseHTMLToReact(product.description)}
          </Description>
        </Details>
      </Container>
    );
  };

  export default ProductPage;
