package com.capstone.repository;

import com.capstone.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Post> findByTitleContainingOrContentContainingOrderByCreatedAtDesc(String title, String content);

    @Query("SELECT DISTINCT p FROM Post p " +
           "LEFT JOIN FETCH p.user " +
           "LEFT JOIN FETCH p.tags " +
           "LEFT JOIN FETCH p.comments " +
           "ORDER BY p.createdAt DESC")
    List<Post> findAllWithUserAndTags();

    @Query("SELECT DISTINCT p FROM Post p " +
           "LEFT JOIN FETCH p.user " +
           "LEFT JOIN FETCH p.tags " +
           "LEFT JOIN FETCH p.comments " +
           "WHERE p.id = :id")
    Post findByIdWithUserAndTags(Long id);
} 