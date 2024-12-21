// @ts-ignore
import React, { Component, useState, useContext } from 'react';
import { ApolloProvider, gql, useQuery, useMutation} from '@apollo/client';
import client from '../apolloClient';
import styled from 'styled-components';
import { NavLink, useLocation } from 'react-router-dom';
import { CartContext } from '../CartContext.tsx';

// GraphQL query to get categories
const GET_CATEGORIES = gql`
  query {
    categories {
      id
      name
    }
  }
`;
const ADD_ORDER = gql`
  mutation AddOrder($items: String!, $total: Float!) {
    addOrder(items: $items, total: $total)
  }
`;
// Styled Components
const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  top: 0;
  left:0;
  z-index: 1000;
`;

const Categories = styled.nav`
  display: flex;
  gap: 30px;
  margin-left:120px;
  @media (max-width: 768px) {
  margin-left:0px;
  }
`;

const CategoryLink = styled(NavLink)`
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
  position: relative;
  &.active {
    color: #5ece7b;
  }
     &.active::after {
    content: '';
    position: absolute;
    bottom: -25px; 
    left: -10%;
    width:120%;
    right: 0;
    height: 2px;
    background-color: #5ece7b;
  }
`;

const CartIcon = styled.div<{ cartItems: any[] }>`
  font-size: 24px;
  cursor: pointer;
  margin-right: 50px;
  position: relative;
  margin-right:120px;
  @media (max-width: 768px) {
  margin-right:40px;
  }
  img {
    filter: ${({ cartItems }) => (cartItems.length === 0 ? 'invert(0.5)' : 'invert(1)')};
  }
`;


const CartOverlayContainer = styled.div`
  position: absolute;
  top: 70px;
  right: 50px;
  width: 320px;
  margin-right:75px;
    font-family: 'Raleway', sans-serif;
  @media (max-width: 768px) {
  margin-right:0px;
  }
  background: #f8f9fa;
  padding: 20px;
  border-radius: 1px;
  max-height: calc(100vh - 100px);
  z-index: 1100;
    overflow-y: auto; /* Dodaje skrolovanje ako sadržaj premaši visinu */
    h3 {
      font-weight: 300;
    }
`;
const CartOverlayOpenedContainer = styled.div`
  position: fixed; /* Prekriva ceo ekran */
  top: 0;
  left: 0;
  width: 100vw; /* Širina celog prozora */
  height: 100vh; /* Visina celog prozora */
  background: rgba(0, 0, 0, 0.5); /* Prozirno siva boja */
  z-index: 950;
  display: flex;
  justify-content: center; /* Centriranje sadržaja po horizontalnoj osi */
  align-items: center; /* Centriranje sadržaja po vertikalnoj osi */
`;
const Container123 = styled.div`
   width: 100vw; /* Širina celog prozora */
  height: 0vh;
  
`;
const CartTotalContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%; 
  font-weight: 600;
  margin-bottom:30px;
  margin-top: 30px;
`;

const TotalText = styled.p`
  margin: 0; /* Uklanja podrazumevani razmak */
`;

const TotalAmount = styled.p`
  margin: 0;
  font-weight: bold;
`;
const AttributeItem = styled.button<{ isSelected: boolean; isColor: boolean; value: string }>`
    padding: ${(props) => (props.isColor ? '10px' : '8px 8px')};
    font-size: 14px;
    margin: 5px;
      font-family: 'Raleway', sans-serif;
      font-weight: 400;
    border: ${(props) =>
      props.isColor && props.isSelected
        ? '2px solid #39FF14' 
        : '1px solid black'}; // Standardni crni okvir za sve ostale
    background-color: ${(props) =>
      props.isColor ? props.value : props.isSelected ? '#000' : '#fff'}; // Postavka boje za pozadinu
    color: ${(props) =>
      props.isColor
        ? 'transparent' 
        : props.isSelected
        ? '#fff' 
        : '#000'}; // Crni tekst za ostale neselektovane atribute

    &:hover {
      opacity: 0.8;
    }
  `;
const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const CartDetails = styled.div`
  font-size: 16px;
  
`;

const CartButton = styled.button`
  width: 100%;
  background-color: #5ece7b;
  color: white;
        font-family: 'Raleway', sans-serif;
  border: none;
  padding: 10px;
  cursor: pointer;
  font-weight: 600;
  
`;
const CartButtonDisabled = styled.button`
  width: 100%;
  background-color: gray;
        font-family: 'Raleway', sans-serif;

  color: white;
  border: none;
  padding: 10px;
  font-weight: 600;
  
`;
const QuantityControl = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Ravnomerno raspoređuje elemente po visini */
  align-items: center;
  margin-left: auto; 
  margin-right:15px;

  button {
    width: 30px;
    height: 30px;
    font-size: 16px;
    cursor: pointer;
    background-color: #FFF;
    border: solid 1px black;
    color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  p {
    margin: 5px 0;
    font-size: 16px;
  }
`;

const CartCounter = styled.div`
  position: absolute;
  top: 10px; 
  right: 55px; 
  background-color: black;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  font-family: 'Raleway', sans-serif;
  margin-right: 75px;
  z-index: 1200; 
  @media (max-width: 768px) {
  margin-right:0px;
  }
`;

function CategoriesComponent() {
  const { loading, error, data } = useQuery(GET_CATEGORIES);

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p>Error fetching categories!</p>;
  const location = useLocation();

  return (
    <Categories>
      {data.categories.map((category: { id: string; name: string }) => (
        // @ts-ignore
        <CategoryLink key={category.id} to={`/${category.name}`}      data-testid={
          location.pathname === `/${category.name}` ? 'active-category-link' : 'category-link'}>
          {category.name.toUpperCase()}      </CategoryLink>
      ))}
    </Categories>
  );
}
const updateQuantity = (setCartItems: any, index: number, newQuantity: number) => {
  setCartItems((prevCartItems: any) =>
    // @ts-ignore
    prevCartItems.filter((item: any, i: any) =>
      i === index ? newQuantity > 0 : true
    ).map((item: any, i: any) =>
      i === index && newQuantity > 0 ? { ...item, quantity: newQuantity } : item
    )
  );
};
const makeOrder = (cartItems: any[], setCartItems: any, addOrder: any) => {
  if(cartItems.length==0) {
    alert("Your cart is empty, you can't make an order");
    return;
  }
  const orderString = cartItems
    .map((item) => {
      const attributesString = item.attributes
        .map((attr: any) => `${attr.name}: ${attr.selectedValue}`)
        .join(", "); 

      return `${item.name} (${attributesString}) x${item.quantity}`; 
    })
    .join("; ");

  const total = cartItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

  addOrder({ variables: { items: orderString, total } })
    .then((response: any) => {
      console.log("Order successful: ", response.data);
      setCartItems([]); 
      alert("Your order is successful");
    })
    .catch((err: any) => {
      console.error("Order failed: ", err);
      alert("Failed to place order. Please try again.");
    });
};

const toKebabCase = (str: string) => {
  return str
    .toLowerCase() 
    .replace(/\s+/g, "-")               
    .toLowerCase();                     
};
// @ts-ignore
function CartOverlay({ setCartItems, cartItems, toggleOverlay }: any) {
  // @ts-ignore 
  const [addOrder, { loading, error }] = useMutation(ADD_ORDER);

  return (
    <CartOverlayContainer data-testid ="cart-overlay">
                      {cartItems.reduce((total: number, item: any) => total +  item.quantity, 0) === 1  && (
                                      <h3><strong>My Bag,</strong> {cartItems.reduce((total: number, item: any) => total +  item.quantity, 0)} item</h3>

              )}
              {cartItems.reduce((total: number, item: any) => total +  item.quantity, 0) !== 1  && (
                                      <h3><strong>My Bag, </strong>{cartItems.reduce((total: number, item: any) => total +  item.quantity, 0)} items</h3>

              )}
      {cartItems.map((item: any, index: number) => (
        <CartItem key={index}>
          <CartDetails>
            <p style={{ fontWeight: "300" }} >{item.name}</p>
            <p style={{ fontWeight: "600" }} data-testid='cart-item-amount'>${item.price.toFixed(2)}</p>
            {item.attributes.map((attribute: any, index: number) => (
              <div
  key={index}
  data-testid={`cart-item-attribute-${toKebabCase(attribute.name)}`}
>            <p style={{ fontSize: "14px" }}>{attribute.name}: </p>
             {attribute.items.map((item: any, itemIndex: number) => (
               <AttributeItem
               key={itemIndex}
               isSelected={attribute.selectedValue === item.value}
               isColor={attribute.name === 'Color'}
               value={item.value}
               data-testid={
                attribute.selectedValue === item.value
                  ? `data-testid='cart-item-attribute-${toKebabCase(attribute.name)}-${item.displayValue}-selected`
                  : `data-testid='cart-item-attribute-${toKebabCase(attribute.name)}-${item.displayValue}`
              }
             >
               {attribute.name === 'Color' ? '' : item.displayValue}
             </AttributeItem>
          ))}
  </div>
))}

            
          </CartDetails>
          <QuantityControl>
        <button data-testid='cart-item-amount-increase' onClick={() => updateQuantity(setCartItems,index, item.quantity + 1)}>+</button>
        <p>{item.quantity}</p>
        <button data-testid='cart-item-amount-decrease' onClick={() => updateQuantity(setCartItems,index, item.quantity - 1)}>
          -
        </button>
      </QuantityControl>
          <img style={{ marginTop: "auto", marginBottom: "auto", maxWidth:"100px",minWidth:"100px"  }} src={item.image} alt={item.name}/>
        </CartItem>
      ))}
      
      <CartTotalContainer>
      <TotalText>
        <strong>Total </strong>
      </TotalText>
      <TotalAmount data-testid="cart-total">${cartItems.reduce((total: number, item: any) => total + item.price * item.quantity, 0).toFixed(2)}</TotalAmount>
    </CartTotalContainer>
      {cartItems.reduce((total: number, item: any) => total +  item.quantity, 0) > 0  &&    (   <CartButton onClick={() => makeOrder(cartItems, setCartItems, addOrder)}>
  PLACE ORDER
</CartButton>)}
{cartItems.reduce((total: number, item: any) => total +  item.quantity, 0) === 0  &&    (   <CartButtonDisabled>
  PLACE ORDER
</CartButtonDisabled>)}
    </CartOverlayContainer>
  );
  
}

class Header extends Component {
  
  state = {
    cartItems : [],
    showOverlay: false,
  };
 

  toggleOverlay = () => {
    // @ts-ignore
    this.setState((prevState) => ({ showOverlay: !prevState.showOverlay }));
  };
  // @ts-ignore
  componentDidUpdate(prevProps, prevState) {
    if (this.state.cartItems !== prevState.cartItems) {
      if(this.state.cartItems.length > 0) {
        // @ts-ignore
        this.setState((prevState) => ({ showOverlay: true }));
      }
    }
  }
  render() {
    const { showOverlay } = this.state;
    return (
      <ApolloProvider client={client}>
      <CartContext.Consumer>
        {/*     @ts-ignore */}
  {({ cartItems, setCartItems }) => {
    if (this.state.cartItems !== cartItems) {
      this.setState({ cartItems });
    }
    return (
      <Container123>
        <HeaderContainer>
          <CategoriesComponent />
          {cartItems.length > 0 && (
            <CartCounter>
              {cartItems.reduce((total: any, item: any) => total + item.quantity, 0)}
            </CartCounter>
          )}

         
            <CartIcon
              data-testid="cart-btn"
              cartItems={cartItems}
              onClick={(e) => {
                e.stopPropagation();
                this.toggleOverlay();
              }}
            >
              <img
                src="https://pngimg.com/d/shopping_cart_PNG4.png"
                height="25"
                width="25"
              ></img>
            </CartIcon>
          
          {showOverlay  && (
            <CartOverlay
              cartItems={cartItems}
              setCartItems={setCartItems}
              toggleOverlay={this.toggleOverlay}
            />
          )}
        </HeaderContainer>
        {showOverlay  && <CartOverlayOpenedContainer />}
      </Container123>
    );
  }}
</CartContext.Consumer>

    </ApolloProvider>
    );
  }
}

export default Header;
