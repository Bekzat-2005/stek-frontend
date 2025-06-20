import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryService, Category } from '../../services/category.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categories: Category[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];

  showDropdown = false;
  showForm = false;
  editMode = false;
  editedProductId: string | null = null;

  isLoggedIn = false;
  currentUser: any;

  searchTerm: string = '';

  newProduct = {
    title: '',
    description: '',
    price: 0,
    category: ''
  };

  constructor(
    private categoryService: CategoryService,
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.isLoggedIn = true;
    this.currentUser = this.authService.getUser();

    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories = data,
      error: (err) => console.error('Ошибка загрузки категорий', err)
    });
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = data;
      },
      error: (err) => console.error('Ошибка загрузки товаров', err)
    });
  }

  searchProducts() {
    this.productService.searchProducts(this.searchTerm).subscribe({
      next: (data) => this.filteredProducts = data,
      error: (err) => console.error('Ошибка поиска', err)
    });
  }

  filterByCategory(categoryId: string) {
    this.filteredProducts = this.products.filter(
      (product) => product.category && product.category._id == categoryId
    );
  }

  resetFilter() {
    this.filteredProducts = this.products;
  }

  isMyProduct(product: any): boolean {
    return this.currentUser && product.user._id == this.currentUser.id;
  }

  deleteProduct(id: string) {
    this.productService.deleteProduct(id).subscribe({
      next: () => this.loadProducts(),
      error: (err) => console.error('Ошибка при удалении:', err)
    });
  }

  submitProduct() {
    this.productService.createProduct(this.newProduct).subscribe({
      next: () => {
        this.loadProducts();
        this.closeForm();
      },
      error: (err) => console.error('Ошибка при создании товара', err)
    });
  }

  editProduct(product: any) {
    this.editMode = true;
    this.showForm = true;
    this.editedProductId = product._id;
    this.newProduct = {
      title: product.title,
      description: product.description,
      price: product.price,
      category: product.category?._id || ''
    };
  }

  updateProduct() {
    if (!this.editedProductId) return;
    this.productService.updateProduct(this.editedProductId, this.newProduct).subscribe({
      next: () => {
        this.loadProducts();
        this.closeForm();
      },
      error: (err) => console.error('Ошибка при обновлении товара', err)
    });
  }

  closeForm() {
    this.showForm = false;
    this.editMode = false;
    this.editedProductId = null;
    this.resetForm();
  }

  resetForm() {
    this.newProduct = {
      title: '',
      description: '',
      price: 0,
      category: ''
    };
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  hideDropdown() {
    setTimeout(() => this.showDropdown = false, 150);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
